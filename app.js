var express = require('express'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    config = require('./config'),
    db;

require('./lib/db')({}, function(err, _db) {
  if (err) throw err;
  db = _db;
});

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
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

app.post('/keys/:key', function(req, res) {
  if (req.body.token == config.auth_token) {
    db.addOrUpdate(decodeURIComponent(req.params.key), function(err) {
      if (err) console.log(err);
    });
    res.send("", {"Access-Control-Allow-Origin": "*"}, 200);
  } else {
    res.send("", {"Access-Control-Allow-Origin": "*"}, 401);
  }
});

app.get('/keys', function(req, res){
  db.getAll(null, function(err, keys) {
    res.json(keys);
  });
});

app.get('/', function(req, res){
  if (!(req.session && req.session.authed)) {
    res.render('index', { 
      status: req.session.authed 
    });
  } else {
    db.getAll(null, function(err, pins) {
      if (err) throw err;

      res.render('index', {
        status : req.session.authed,
        bookmarklet: fs.readFileSync(__dirname + '/bookmarklet.js'),
        pinned: pins
      });
    });
  }
});

app.post('/', function(req, res) {
  if (req.body.pw) {
    if (bcrypt.compareSync(req.body.pw, config.password)) {
      req.session.authed = true;
    };
  };
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
