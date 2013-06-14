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

var players = {};

// Gameplay.
var io = socketIO.listen(app);
io.sockets.on('connection', function (socket) {
  // Add the new player.
  players[socket.id] = {
    position: { x: 0, y: 0 }, // TODO: Decide where to spawn based on world state (away from other players?).
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
    length: 1
  };

  // Send the world.
  socket.emit('update', {
    players: players
  });

  socket.on('move', function (requestData) {
    var player = players[socket.id];
    // TODO: Handle wraparound.
    switch(requestData.direction) {
      case 'left':
        player.position.x--;
        break;
      case 'up':
        player.position.y--;
        break;
      case 'right':
        player.position.x++;
        break;
      case 'down':
        player.position.y++;
        break;
    }
    socket.emit('update', {
        players: players
    });

    console.log('Player ' + socket.id + ' moved ' + requestData.direction + ' to', player.position);
  });
});
