var WIDTH = 15;
var HEIGHT = 10;

var Board = {
  /* Initialize grid */
  initialize: function() {
    var grid = "";
    $("#grid").css({"height": HEIGHT*50, "width": WIDTH*50 });
    for (var i = 0; i < WIDTH*HEIGHT; i++) {
      grid = grid + '<div id="sq-' +
         String(Math.floor(i/WIDTH)) + '-' +
         String(i%WIDTH) + '" class="sq"></div>';
    }
    $("#grid").append(grid);
  },

  /* Reset the board to an empty state. */
  wipe: function() {
    $('#grid .sq').removeClass().addClass('sq');
  },

  // TODO: Probably move most player logic out of here.
  update: function(worldState) {
    Board.wipe();

    // TODO? If this is a performance bottleneck we could combine it with the 
    // wipe() loop to only hit each cell once.
    for(var id in worldState.players) {
      var player = worldState.players[id];
      var playerCell = Board.getCell(player.position);
      playerCell.element.addClass(player.team);
    }
  },

  getCell: function(position) {
    // TODO: Cell object?
    return {
      element: $('#sq-' + position.y + '-' + position.x)
    };
  }
};
