var me = undefined;

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

  socketIO.on('update', function socketUpdateHandler(data) {
    me = data.players[socketIO.socket.sessionid];
    $('html').addClass('team-' + me.team);
    Board.update(data);
  });

  $('#controls .move').click(function moveClickHandler(event) {
    emitMove($(this).data('direction'));
  });

  // Allow using arrow keys for movement.
  $(document).keydown(function keydownHandler(event) {
    var direction;
    switch(event.which) {
      case 37: // left arrow
        direction = 'left';
      break;

      case 38: // up arrow
        direction = 'up';
      break;

      case 39: // right arrow
        direction = 'right';
      break;

      case 40: // down arrow
        direction = 'down';
      break;
    }

    emitMove(direction);
    $('#controls button.' + direction).addClass('active');
  });
  $(document).keyup(function keyupHandler() {
    $('#controls button').removeClass('active');
  });
});
