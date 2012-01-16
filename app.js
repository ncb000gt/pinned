var express = require('express'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    config = require('./config'),
    pins = new (require('./lib/pins'))({});

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

app.get('/share', function(req, res) {
  res.render('index', {
    status : req.session.authed,
    bookmarklet: fs.readFileSync(__dirname + '/bookmarklet.js'),
    pinned: pins
  });
});

app.options('/pins', function(req, res) {
  res.send("", {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "PUT", "Access-Control-Allow-Headers": "Origin, Content-Type"}, 200);
});

app.post('/pins', function(req, res) {
  if (req.body.token == config.auth_token) {
    pins.post(req.body.href, { 
      "title" : req.body.title, 
      "domain" : req.body.domain,
      "target" : req.body.target || "_blank",
      "image" : req.body.image || false,
      "show" : req.body.show || true
    }, function(err) {
      if (err) console.log(err);
    });
    res.send("", {"Access-Control-Allow-Origin": "*"}, 200);
  } else {
    res.send("", {"Access-Control-Allow-Origin": "*"}, 401);
  }
});

app.get('/pins', function(req, res){
  pins.get(null, function(err, data) {
    res.json(data);
  });
});

app.get('/', function(req, res){
  if (!(req.session && req.session.authed)) {
    res.render('index', { 
      status: req.session.authed 
    });
  } else {
    pins.get(null, function(err, _pins) {
      if (err) throw err;

      res.render('index', {
        status : req.session.authed,
        bookmarklet: fs.readFileSync(__dirname + '/bookmarklet.js'),
        pinned: _pins
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
