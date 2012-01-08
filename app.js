var express = require('express'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    config = require('./config'),
    db = require('./lib/db')();

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "say WUUUUT?!?"
  }));
  app.use(app.router);
});

app.options('/keys/:key', function(req, res) {
  res.send("", {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "PUT", "Access-Control-Allow-Headers": "Origin, Content-Type"}, 200);
});

app.put('/keys/:key', function(req, res) {
  db.add(req.params.key);
  res.send("", {"Access-Control-Allow-Origin": "*"}, 200);
});

app.get('/keys', function(req, res){
  db.getAll(null, function(err, keys) {
    res.json(keys);
  });
});

app.get('/', function(req, res){
  if (!(req.session && req.session.authed)) {
    res.render('login', {
    });
  } else {
    var bookmarklet = fs.readFileSync('./bookmarklet.js');
    res.render('home', {
      bookmarklet: bookmarklet,
      pinned: [{url: '/test'}]
    });
  }
});

app.post('/', function(req, res) {
  if (req.body && req.body.pw) {
    var pw = req.body.pw;
    if (bcrypt.compare_sync(pw, config.password)) {
      req.session.authed = true;
    }
  }

  res.redirect('/');
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
