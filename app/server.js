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

var board = require('./board.js');

var players = {};

var app = http.createServer(function(req, res) {
  console.log("Request started");
  var filePath = '.' + req.url;
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
          teams[playerTeam] += player.length;
        }
        else {
          teams[playerTeam] = player.length;
        }
      }
      var teamNames = ["red", "green", "blue"];
      var minLength = teams["red"];
      var minTeam = "red"
      console.dir(teams);
      for (var i = 1; i < teamNames.length; i++) {
        if (teams[teamNames[i]] == null) {
          teams[teamNames[i]] = 0;
        }
        if (teams[teamNames[i]] < minLength) {
          minLength = teams[teamNames[i]];
          minTeam = teamNames[i];
        }
      }
      return minTeam;
    })(),
    length: 3,
    lastDirection: 'right',
    tail: [board.wrapAround({"x": randX-1, "y": randY}),
           board.wrapAround({"x": randX-2, "y": randY}),
           board.wrapAround({"x": randX-3, "y": randY}),
           board.wrapAround({"x": randX-4, "y": randY}),
           board.wrapAround({"x": randX-5, "y": randY}),
           board.wrapAround({"x": randX-6, "y": randY})]
  };

  // Send the world.
  socket.emit('update', {
    players: players
  });

  socket.on('move', function (requestData) {
    var player = players[socket.id];

    var newPosition = player.position;
    // Consider player inertia
    player.lastDirection = requestData.direction;
    // TODO: Need to use this lastDirection to force unresponsive players to continue moving after an arbitrary period of time

    if (player.tail.length > 0) {
      var newTail = [];
      newTailPosition = {x: player.position.x, y: player.position.y}
      newTail.push(newTailPosition);
      for (var i = 0; i < player.tail.length-1; i++) {
        newTailPosition = {x: player.tail[i].x, y: player.tail[i].y}
        newTail.push(newTailPosition);
      }
      player.tail = newTail;
    }

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

    // Wrap around if necessary.
    player.position = board.wrapAround(newPosition);

    // Collision detection - check current head against other cells
    for (var otherPlayerId in players) {
      if (otherPlayerId == socket.id) {
        continue;
      }
      otherPlayer = players[otherPlayerId];
      if (otherPlayer.position.x == player.position.x &&
          otherPlayer.position.y == player.position.y) {
        console.log("COLLISION: " + socket.id + " (" + player.team + ") " +
          " hit " + otherPlayerId + " (" + otherPlayer.team + ") ");
      } // TODO: Send update to clients, take server action
    }

    // Send the update to all players.
    console.log('Broadcasting update.');
    io.sockets.emit('update', {
        players: players
    });

    console.log('Player ' + socket.id + ' moved ' + requestData.direction + ' to', player.position);
  });
});
