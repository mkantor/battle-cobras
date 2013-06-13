var WIDTH = 15;
var HEIGHT = 10;
$(document).ready(function() {
  /* Initialize grid */
  var grid = "";
  $("#grid").css({"height": HEIGHT*50, "width": WIDTH*50 }); 
  for (var i = 0; i < WIDTH*HEIGHT; i++) {
    grid = grid + '<div id="sq-' +
       String(Math.floor(i/HEIGHT)) + '-' +
       String(i%WIDTH) + '" class="sq"></div>';
  }
  $("#grid").append(grid);
});
