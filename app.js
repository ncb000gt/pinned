var express = require('express'),
    db = require('./lib/db')();

var app = module.exports = express.createServer();

app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
});

app.options('/:key', function(req, res) {
  res.send("", {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "PUT", "Access-Control-Allow-Headers": "Origin, Content-Type"}, 200);
});

app.put('/:key', function(req, res) {
  db.add(req.params.key);
  res.send("", {"Access-Control-Allow-Origin": "*"}, 200);
});

app.get('/', function(req, res){
  db.getAll(null, function(err, keys) {
    res.json(keys);
  });
});

app.listen(process.env.NODE_PORT || (process.env.NODE_ENV === 'production' ? 80 : 8000)); 

console.log('Server listening on ' + app.address().port);

process.on("exit", function() {
  console.log("Shutdown Server.");
});

process.on("SIGINT", function() {
  console.log("Server interupted.");
  process.exit(0);
});
