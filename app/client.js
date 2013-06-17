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
  };

  Board.initialize();

  var socketIO = io.connect(':3000');

  socketIO.on('update', socketUpdateHandler);
  function socketUpdateHandler(data) {
    // Only handle one update at a time for performance reasons.
    socketIO.removeListener('update', socketUpdateHandler);

    me = data.players[socketIO.socket.sessionid];
    Board.update(data);

    if(me && me.alive) {
      $(document.documentElement).addClass('team-' + me.team);
    } else {
      // You died or were culled.
      $(document.documentElement).removeClass();
      $('#game-messages').html('<p>You died!</p> <p><a href=".">Reload the page</a> to play again.</p>');
    }

    // After done handling this update, reattach the handler.
    socketIO.on('update', socketUpdateHandler);
  };

  /* User input. */
  $('#controls .move').tap(function moveClickHandler(event) {
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

    if(direction) {
      emitMove(direction);
      $('#controls button.' + direction).addClass('active');
    }
  });
  $(document).keyup(function keyupHandler() {
    $('#controls button').removeClass('active');
  });

  $(window).unload(function() {
    socketIO.emit('quit');
  });
});
