var http = require('http');
var fs = require('fs');
var socketIO = require('socket.io');

fs.readFile('./client.html', function (err, html) {
  if (err) {
    throw err;
  }

  var app = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(html);
      res.end();
  });
  app.listen(80);
  console.log('Server listening on port 80');

  var io = socketIO.listen(app);
  io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });
});
