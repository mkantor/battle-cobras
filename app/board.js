(function(exports) {

  // The *actual* size of the board.
  exports.width = 31;
  exports.height = 31;

  // The view can be smaller than the actual board if needed (although the 
  // current frontend doesn't care).
  var viewWidth = 31;
  var viewHeight = 31;

  var cells = {};
  var centerAbsolutePosition = { x: undefined, y: undefined };

  var grid;

  /* Initialize grid */
  exports.initialize = function() {
    var x = 0;
    var y = 0;
    var row = 0;
    var column = 0;
    var cell;

    grid = $('#grid');

    var visibleCells = Board.getVisibleWidth() * Board.getVisibleHeight();

    for (var i = 0; i < visibleCells; i++) {
      cell = $('<div class="sq"></div>').css({
        height: (100 / exports.getVisibleHeight()) + '%',
        width: (100 / exports.getVisibleWidth()) + '%'
      });

      // Note that these coordinates are relative to the center, not the same 
      // as position coordinates (which are absolute).
      row = Math.floor(i / Board.getVisibleWidth());
      column = i % Board.getVisibleWidth();

      y = row - Math.floor(exports.getVisibleHeight() / 2);
      x = column - Math.floor(exports.getVisibleWidth() / 2);

      if(column == 0) {
        cell.addClass('first-column');
      }
      if(column == viewWidth - 1) {
        cell.addClass('last-column');
      }
      if(row == 0) {
        cell.addClass('first-row');
      }
      if(row == viewHeight - 1) {
        cell.addClass('last-row');
      }

      cell.attr({
        'data-x': x,
        'data-y': y
      });

      if(cells[x] === undefined) {
        cells[x] = {};
      }
      cells[x][y] = cell;

      grid.append(cell);
    }
  };

  /* Reset the board to an empty state. */
  exports.wipe = function() {
    $('.player', grid).remove();
  };

  exports.update = function(worldState) {
    if(me) {
      centerAbsolutePosition = me.position;
    }
    Board.wipe();
    exports.worldState = worldState;

    // TODO? If this is a performance bottleneck we could combine it with the 
    // wipe() loop to only hit each cell once.
    for(var id in worldState.players) {
      drawPlayer(worldState.players[id]);
    }

    grid.trigger('updated.battle-cobras');
  };
  function drawPlayer(player) {
    if(player.alive === false) {
      return;
    }

    var headCell = Board.getCell(player.position, 'absolute');
    if(headCell) {
      var head = '<span class="player head ' + player.team + '"></span>';
      headCell.append(head);
    }

    for(var i = 0; i < player.tail.length; i++) {
      var tailCell = Board.getCell(player.tail[i], 'absolute');
      if(tailCell) {
        var tail = '<span class="player tail ' + player.team + '"></span>';
        tailCell.append(tail);
      }
    }
  };

  exports.getCenterAbsolutePosition = function() {
    return centerAbsolutePosition;
  };

  exports.getVisibleWidth = function() {
    return viewWidth;
  };

  exports.getVisibleHeight = function() {
    return viewHeight;
  };

  // Note: This can return a position that is not currently visible.
  exports.absoluteToRelativePosition = function(absolutePosition) {

    var center = Board.getCenterAbsolutePosition();

    // FIXME: Reduce code duplication here.

    var relativeX = absolutePosition.x - center.x;
    if(Math.abs(relativeX) > Math.floor(Board.getVisibleWidth() / 2)) {
      if(relativeX < 0) {
        relativeX += Board.width;
      } else {
        relativeX -= Board.width;
      }
    }

    var relativeY = absolutePosition.y - center.y;
    if(Math.abs(relativeY) > Math.floor(Board.getVisibleHeight() / 2)) {
      if(relativeY < 0) {
        relativeY += Board.height;
      } else {
        relativeY -= Board.height;
      }
    }

    var relativePosition = {
      x: relativeX,
      y: relativeY
    };

    return relativePosition;
  };

  exports.relativeToAbsolutePosition = function(relativePosition) {
    var center = Board.getCenterAbsolutePosition();

    var x = (relativePosition.x + center.x) % Board.width;
    if(x < 0) {
      x += Board.width;
    }

    var y = (relativePosition.y + center.y) % Board.height;
    if(y < 0) {
      y += Board.height;
    }

    var absolutePosition = { x: x, y: y };

    return absolutePosition;
  };

  exports.getCell = function(position, positionType) {
    if(positionType == 'absolute') {
      position = Board.absoluteToRelativePosition(position);
    }

    return cells[position.x][position.y];
  };

  exports.wrapAround = function(position) {
    return {
      x: wrapDimension(position.x, 'width'),
      y: wrapDimension(position.y, 'height')
    };
  };
  function wrapDimension(coord, dimension) {
    return coord < 0 ? exports[dimension] + coord : coord % exports[dimension];
  }

})(typeof exports === 'undefined' ? exports = this.Board = {} : exports);
// Above line: If this isn't loaded as a module, plop it into `this` (on the 
// client if loaded via a script tag, `this` will be `window`).
