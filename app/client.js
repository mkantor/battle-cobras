$(document).ready(function() {

  Board.initialize();

  var socketIO = io.connect(':3000');
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

  // Allow using arrow keys for movement.
  $(document).keydown(function(event) {
    switch(event.which) {
      case 37: // left arrow
        socketIO.emit('move', { direction: 'left' });
      break;

      case 38: // up arrow
        socketIO.emit('move', { direction: 'up' });
      break;

      case 39: // right arrow
        socketIO.emit('move', { direction: 'right' });
      break;

      case 40: // down arrow
        socketIO.emit('move', { direction: 'down' });
      break;
    }
  });
});