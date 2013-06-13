$(document).ready(function() {

  Board.initialize();

  /* Handle world updates. */
  var socketIO = io.connect('http://localhost:3000');
  socketIO.on('update', function (data) {
    var me = data.players[socketIO.socket.sessionid];
    var myCell = Board.getCell(me.position);
    myCell.element.addClass(me.team);
  });

  $('#controls .move').click(function(event) {
    console.log('moving...', socketIO); // XXX
    socketIO.emit('move', $(this).data());
  });
});