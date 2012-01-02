var express = require('express'),
    db = require('./lib/db')();

var app = module.exports = express.createServer();

app.configure(function(){
  var pub = __dirname + '/public';
  app.use(app.router);
});

app.put('/:key', function(req, res) {
  db.add(req.params.key);
  res.send(200);
});

app.get('/', function(req, res){
  db.getAll(null, function(err, keys) {
    res.json(keys);
  });
});

app.listen(process.env.NODE_ENV === 'production' ? 80 : 8000); 

console.log('Server listening on ' + app.address().port);

process.on("exit", function() {
  console.log("Shutdown Server.");
});

process.on("SIGINT", function() {
  console.log("Server interupted.");
  process.exit(0);
});
