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

// Gameplay.
var io = socketIO.listen(app);
io.sockets.on('connection', function (socket) {
  socket.emit('update', {
      players: {
        me: {
          id: 1,
          position: { x: 0, y: 0 }, // TODO: Decide where to spawn based on world state (away from other players?).
          team: 'red' // TODO: Use the team which is currently losing.
        }
        // ... probably other players with ids as property names.
      }
  });
  socket.on('move', function (data) {
    console.log('>>> A player tried to move!', data);
  });
});
