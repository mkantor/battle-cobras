$(document).ready(function() {

  Board.initialize();

  var socketIO = io.connect('http://localhost:3000');
  socketIO.on('connect', function() {
    console.log('Your session id is ' + socketIO.socket.sessionid);
  });

  socketIO.on('update', function(data) {
    console.log('update', data);
    Board.update(data);
  });

  $('#controls .move').click(function(event) {
    socketIO.emit('move', $(this).data());
  });
});