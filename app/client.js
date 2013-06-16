var me = undefined; // TODO: Player object?

$(document).ready(function() {

  var emitMove = function(dir) {
    player = Board.worldState.players[socketIO.socket.sessionid];
    newPosition = {x: player.position.x, y: player.position.y}
    switch(dir) {
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
    newPosition = Board.wrapAround(newPosition);
    for (var i = 0; i < player.tail.length; i++) {
      tailPos = player.tail[i];
      if (newPosition.x == tailPos.x &&
          newPosition.y == tailPos.y) {
        return false;
      }
    }
    socketIO.emit('move', { direction: dir });
  }

  Board.initialize();

  var socketIO = io.connect(':3000');
  socketIO.on('connect', function() {
    console.log('Your session id is ' + socketIO.socket.sessionid);
  });

  socketIO.on('update', function(data) {
    console.log('update message from socket.io', data);
    me = data.players[socketIO.socket.sessionid];
    console.log('I am', me);
    Board.update(data);
  });

  $('#controls .move').click(function(event) {
    emitMove($(this).data('direction'));
  });

  // Allow using arrow keys for movement.
  $(document).keydown(function(event) {
    switch(event.which) {
      case 37: // left arrow
        emitMove('left');
      break;

      case 38: // up arrow
        emitMove('up');
        //socketIO.emit('move', { direction: 'up' });
      break;

      case 39: // right arrow
        emitMove('right');
      break;

      case 40: // down arrow
        emitMove('down');
      break;
    }
  });
});
