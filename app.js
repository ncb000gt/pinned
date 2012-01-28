var express = require('express'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    config = require('./config'),
    db = require('./lib/db'),
    pins = new (require('./lib/pins'))(),
    users = new (require('./lib/users'))(),
    setupdb = new db({key: 'setup', collection_name: 'setup'}),
    auth = require('./lib/auth'),
    errors = require('./lib/errors');

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

//support XSS requests
app.options('/pins', function(req, res) {
  res.send("", {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "PUT", "Access-Control-Allow-Headers": "Origin, Content-Type"}, 200);
});

//pin url
app.post('/pin', function(req, res) {
  if (req.body.token == config.auth_token) {
    pins.save(req.body.href, { 
      "href": req.body.href,
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

//get all pins
app.get('/pins', function(req, res){
  pins.get(null, function(err, data) {
    res.json(data);
  });
});

//setup app
app.get('/setup', function(req, res) {
});

app.post('/setup', function(req, res) {
  var un = req.body.username;
  var pw = req.body.password;
  var email = req.body.email;

  setupdb._get('0', function(err, setup) {
    if (!err && setup) {
      res.send(403);
    } else if (!err) {
      setupdb.save('0', {'setup':'0', 'updated': []});
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(pw, salt, function(err, hash) {
          users.save(un, {username: un, hash: hash, email: email});
          res.send(200);
        });
      });
    } else {
      console.log(err);
      res.send(500);
    }
  });
});

app.get('/', function(req, res, next) {
  if (!(auth.authorized(req))) {
    res.render('index', {
      error: (req.session && req.session.error) ? req.session.error.message : null,
      status: false 
    });
  } else {
    pins.get(null, function(err, _pins) {
      if (err) throw err;

      res.render('index', {
        error: null,
        status : req.session.authed,
        bookmarklet: fs.readFileSync(__dirname + '/bookmarklet.js'),
        pinned: _pins
      });
    });
  }
});

app.post('/', function(req, res) {
  auth.authorize(req, res, function(err) {
    if (err) req.session.error = err;
    res.redirect('/');
  });
});

app.error(function(err, req, res, next) {
  if (err instanceof errors.NotFound) {
    res.send(404);
  } else if (err instanceof errors.BadRequest) {
    res.send(401);
  } else {
    next(err);
  }
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
