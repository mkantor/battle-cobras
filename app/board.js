// If this isn't loaded as a module, plop it into `this` (on the client if 
// loaded via a script tag, `this` will be `window`).
if(typeof exports === 'undefined') {
  var exports = this.Board = {};
}

(function(exports) {

  exports.width = 31;
  exports.height = 31;

  /* Initialize grid */
  exports.initialize = function() {
    // Height/width of cells in px.
    var cellSize = 20;

    var x = 0;
    var y = 0;
    $("#grid").css({
      "height": Board.height * cellSize,
      "width": Board.width * cellSize
    });
    for (var i = 0; i < Board.width * Board.height; i++) {
      y = Math.floor(i / Board.width);
      x = i % Board.width;
      $("#grid").append($('<div id="sq-' + y + '-' + x + '" class="sq"></div>').css({
        height: cellSize,
        width: cellSize
      }));
    }
  };

  /* Reset the board to an empty state. */
  exports.wipe = function() {
    $('#grid .sq').removeClass().addClass('sq');
  };

  // TODO: Probably move most player logic out of here.
  exports.update = function(worldState) {
    Board.wipe();
    exports.worldState = worldState;
    // TODO? If this is a performance bottleneck we could combine it with the 
    // wipe() loop to only hit each cell once.
    for(var id in worldState.players) {
      var player = worldState.players[id];
      var playerCell = Board.getCell(player.position);
      playerCell.element.addClass(player.team);
      console.dir(player);
      var playerTailCells = {}
      for (var i = 0; i < player.tail.length; i++) {
        position = player.tail[i];
        cell = Board.getCell(position);
        cell.element.addClass(player.team);
      }
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
