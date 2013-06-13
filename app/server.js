var http = require('http');
var fs   = require('fs');

fs.readFile('./client.html', function (err, html) {
  if (err) {
    throw err;
  }
  http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(html);
      res.end();
  }).listen(3000);
});
console.log('Server running on port 3000');
