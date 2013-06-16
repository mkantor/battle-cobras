$(document).ready(function() {

  var socketIO = io.connect(':3000');

  socketIO.on('connect', function() {
    console.log('Your session id is ' + socketIO.socket.sessionid);
  });

  socketIO.on('update', function(data) {
    console.log('update message from socket.io', data);
    console.log('I am', data.players[socketIO.socket.sessionid]);
  });

  // Display absolute coordinates of each cell.
  $('#grid').on('updated.battle-cobras', function() {
    $('.sq').each(function() {
      var cell = $(this);
      var absoluteCellPosition = Board.relativeToAbsolutePosition({
        x: cell.data('x'),
        y: cell.data('y')
      });
      cell.html('x:' + absoluteCellPosition.x + '<br/>y:' + absoluteCellPosition.y);
    });
  });

});