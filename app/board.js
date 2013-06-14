// If this isn't loaded as a module, plop it into `this` (on the client if 
// loaded via a script tag, `this` will be `window`).
if(typeof exports === 'undefined') {
  var exports = this.Board = {};
}

(function(exports) {

  exports.width = 15;
  exports.height = 10;

  /* Initialize grid */
  exports.initialize = function() {
    var grid = "";
    $("#grid").css({
      "height": Board.height * 50,
      "width": Board.width * 50
    });
    for (var i = 0; i < Board.width * Board.height; i++) {
      grid = grid + '<div id="sq-' +
         String(Math.floor(i / Board.width)) + '-' +
         String(i % Board.width) + '" class="sq"></div>';
    }
    $("#grid").append(grid);
  };

  /* Reset the board to an empty state. */
  exports.wipe = function() {
    $('#grid .sq').removeClass().addClass('sq');
  };

  // TODO: Probably move most player logic out of here.
  exports.update = function(worldState) {
    Board.wipe();

    // TODO? If this is a performance bottleneck we could combine it with the 
    // wipe() loop to only hit each cell once.
    for(var id in worldState.players) {
      var player = worldState.players[id];
      var playerCell = Board.getCell(player.position);
      playerCell.element.addClass(player.team);
    }
  };

  exports.getCell = function(position) {
    // TODO: Cell object?
    return {
      element: $('#sq-' + position.y + '-' + position.x)
    };
  };

  exports.wrapAround = function(position) {
    return {
      x: wrapDimension(position.x, 'width'),
      y: wrapDimension(position.y, 'height')
    };
  }
  function wrapDimension(coord, dimension) {
    return coord < 0 ? exports[dimension] + coord : coord % exports[dimension];
  }

})(exports);