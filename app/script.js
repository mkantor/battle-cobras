$(document).ready(function() {

  Board.initialize();

  /* Handle world updates. */
  var socket = io.connect('http://localhost:3000');
  socket.on('update', function (data) {
    var myCell = Board.getCell(data.players.me.position);
    myCell.element.addClass(data.players.me.team);
  });

  $('#controls .move').click(function(event) {
    console.log('moving...', socket); // XXX
    socket.emit('move', $(this).data());
  });
});