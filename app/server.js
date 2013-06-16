Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

var http = require('http');
var path = require('path');
var fs = require('fs');
var socketIO = require('socket.io');
var url = require('url');

var board = require('./board.js');

var players = {};

var app = http.createServer(function(req, res) {
  console.log("Client requested " + req.url);
  var parsedUrl = url.parse(req.url, true);

  // Assume paths are relative to this directory.
  var filePath = '.' + parsedUrl.pathname;
  if (filePath == './') {
    filePath = './client.html';
  }

  var extname = path.extname(filePath);
  var contentType = 'text/html; charset=utf-8';
  switch(extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
  }

  path.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(err, content) {
        if (err) {
          res.writeHead(500);
          res.end();
        }
        else {
          res.writeHead(200, {'Content-Type': contentType});
          res.write(content);
          res.end();
        }
      });
    }
    else {
      res.writeHead(404);
      res.end();
    }
  });
}).listen(80);

// Gameplay.
var io = socketIO.listen(app);
io.sockets.on('connection', function (socket) {
  // Add the new player.
  var randX = Math.floor((Math.random()*board.width)+1);
  var randY = Math.floor((Math.random()*board.height)+1);
  players[socket.id] = {
    position: { x: randX,
                y: randY }, // TODO: Decide where to spawn based on world state (away from other players?).
    team: (function() {
      var teams = {};
      for (var player in players) {
        playerTeam = players[player].team;
        if (teams[playerTeam]) {
          teams[playerTeam] += players[player].tail.length;
        }
        else {
          teams[playerTeam] = players[player].tail.length;
        }
      }
      var teamNames = ["red", "green", "blue"];
      var minLength = teams["red"];
      var minTeam = "red"
      console.dir(teams);
      for (var i = 1; i < teamNames.length; i++) {
        if (teams[teamNames[i]] === undefined) {
          teams[teamNames[i]] = 0;
        }
        if (teams[teamNames[i]] < minLength) {
          minLength = teams[teamNames[i]];
          minTeam = teamNames[i];
        }
      }
      return minTeam;
    })(),
    alive: true,
    lastDirection: 'right',
    tail: [board.wrapAround({"x": randX-1, "y": randY}),
           board.wrapAround({"x": randX-2, "y": randY}),
           board.wrapAround({"x": randX-3, "y": randY}),
           board.wrapAround({"x": randX-4, "y": randY}),
           board.wrapAround({"x": randX-5, "y": randY}),
           board.wrapAround({"x": randX-6, "y": randY})],
    lastTailPos: board.wrapAround({x: randX-7, y: randY})
  };

  // Send the world.
  socket.emit('update', {
    players: players
  });

  socket.on('move', function (requestData) {
    var player = players[socket.id];
    if (player.alive === false) {
      return;
    }

    var newPosition = {x: player.position.x, y: player.position.y};
    // Consider player inertia
    player.lastDirection = requestData.direction;
    // TODO: Need to use this lastDirection to force unresponsive players to continue moving after an arbitrary period of time

    switch(requestData.direction) {
      case 'left':
        newPosition.x--;
        break;
      case 'up':
        newPosition.y--;
        break;
      case 'right':
        newPosition.x++;
        break;
      case 'down':
        newPosition.y++;
        break;
    }
    
    player.lastTailPos = null
    if (player.tail.length > 0) {
      last = player.tail[player.tail.length-1];
      player.lastTailPos = {x: last.x, y: last.y};
      player.lastTailPos = board.wrapAround(player.lastTailPos);
      // Head movement check
      var moved = true;
      for (var i = 0; i < player.tail.length; i++) {
        if (newPosition.x == player.tail[i].x &&
            newPosition.y == player.tail[i].y) {
          newPosition = {x: player.position.x, y: player.position.y};
          moved = false;
          break;
        }
      }
      // Tail update
      if (moved) {
        var newTail = [];
        newTailPosition = {x: player.position.x, y: player.position.y}
        newTail.push(newTailPosition);
        for (var i = 0; i < player.tail.length-1; i++) {
          newTailPosition = {x: player.tail[i].x, y: player.tail[i].y}
          newTail.push(newTailPosition);
        }
        player.tail = newTail;
      }
    }

    var appendToTail = function(player) {
      lastTailPos = player.lastTailPos;
      if (lastTailPos != null) {
        var currentLastTail = player.tail[player.tail.length-1];
        var newTailPos = {x: lastTailPos.x, y: lastTailPos.y};
        var diff = {x: currentLastTail.x - newTailPos.x,
                    y: currentLastTail.y - newTailPos.y};
        newTailPos = board.wrapAround(newTailPos);
        player.tail.push(newTailPos);
        player.lastTailPos = {x: newTailPos.x, y: newTailPos.y};
        player.lastTailPos = {x: newTailPos.x - diff.x,
                              y: newTailPos.y - diff.y}
      }
      else {
        var newTailPos = {x: player.position.x, y: player.position.y}
        switch (player.lastDirection) {
          case 'left':
            newTailPos.x++;
            break;
          case 'up':
            newTailPos.y++;
            break;
          case 'right':
            newTailPos.x--;
            break;
          case 'down':
          default:
            newTailPos.y--;
            break;
        }
        player.tail.push(newTailPos);
      }
    }

    // Wrap around if necessary.
    player.position = board.wrapAround(newPosition);

    // Collision detection - check current head against other cells
    for (var otherPlayerId in players) {
      if (otherPlayerId == socket.id) {
        continue;
      }
      var collision = false;
      var headCollision = false;
      // Head collision
      otherPlayer = players[otherPlayerId];
      if (otherPlayer.position.x == player.position.x &&
          otherPlayer.position.y == player.position.y) {
        console.log("COLLISION: " + socket.id + " (" + player.team + ") " +
          " hit " + otherPlayerId + " (" + otherPlayer.team + ") ");
        collision = true;
        headCollision = true;
      }
      // Tail collision
      for (var i = 0; i < otherPlayer.tail.length; i++) {
        tailPos = otherPlayer.tail[i];
        if (tailPos.x == player.position.x &&
            tailPos.y == player.position.y) {
          console.log("COLLISION WITH TAIL: " + socket.id + " (" +
            player.team + ") " + " hit " + otherPlayerId + " (" +
            otherPlayer.team + ") ");
          collision = true;
          break;
        }
      }
      if (collision == true) {
        if ((player.team == "red" && otherPlayer.team == "green") ||
            (player.team == "green" && otherPlayer.team == "blue") ||
            (player.team == "blue" && otherPlayer.team == "red")) {
          if (otherPlayer.tail.length == 0) {
            otherPlayer.alive = false;
          }
          else {
            otherPlayer.tail.pop();
          }
          // Append to eater tail
          appendToTail(player);
        }
        // self harm
        else if ((player.team == "red" && otherPlayer.team == "blue") ||
                 (player.team == "blue" && otherPlayer.team == "green") ||
                 (player.team == "green" && otherPlayer.team == "red")) {
          if (player.tail.length == 0) {
            player.alive = false;
          }
          else {
            player.tail.pop();
          }
          if (headCollision) {
            appendToTail(otherPlayer);
          }
        }
      }
    }

    // Send the update to all players.
    console.log('Broadcasting update.');
    io.sockets.emit('update', {
        players: players
    });

    console.log('Player ' + socket.id + ' moved ' + requestData.direction + ' to', player.position);
  });
});
