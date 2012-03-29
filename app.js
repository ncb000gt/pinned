var express = require('express'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    db = require('./lib/db'),
    pins = new (require('./lib/dbs/pins'))(),
    users = new (require('./lib/dbs/users'))(),
    // share = require('./lib/share'),
    user_functions = require('./lib/user_functions'),
    setup = require('./lib/urls/setup'),
    errors = require('./lib/errors'),
    setupdb = new db({key: 'setup', collection_name: 'setup'}),
    config = {};

try {
  config = require('./config');
} catch(e) {}

var BOOKMARKLET_TEMPLATE = fs.readFileSync(__dirname + '/templates/bookmarklet.js.template', 'utf8');
var BOOKMARK_TEMPLATE = fs.readFileSync(__dirname + '/templates/bookmark.js.template', 'utf8');

var app = module.exports = express.createServer();

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: "say WUUUUT?!?"
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.use('/setup', express.router(setup));
// app.use('/share', express.router(share));

app.get(/bookmark.js/, function(req, res) {
  var host = 'http://' + req.headers['host'];
  //TODO: consider; per-user auth codes may be a terrible way to go about this task.
  if (req.query && req.query.auth_code) {
    return res.send(
      BOOKMARK_TEMPLATE
        .replace(/{{REPLACE_HOST}}/g, host)
        .replace(/{{AUTH_TOKEN}}/, "'" + req.query.auth_code+ "'"), {
          "Content-Type" : "application/javascript"
        }
    );
  }
  return res.send(401);
});

//pin url
app.post('/pin', function(req, res) {
  if (req.body && req.body.token) {
    users.find({'auth_code': req.body.token}, function(err, docs) {
      if (!err && docs.length > 0) {
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
        return res.send("", {"Access-Control-Allow-Origin": "*"}, 200);
      } else {
        return res.send("", {"Access-Control-Allow-Origin": "*"}, 401);
      }
    });
  } else {
    return res.send("", {"Access-Control-Allow-Origin": "*"}, 400);
  }
});

//get all pins
app.get('/pins', function(req, res){
  pins.find(function(err, pins) {
    res.json(pins.map(function(item) {
      var url = item.title;
      if (title.match(/https?:\/\//)) {
        var s = title.split('/');
        title = s[s.length-1];
        item.title = title;
      }
      return item;
    }));
  });
});

app.post('/login', function(req, res) {
  user_functions.authorize(req, res, function(err) {
    if (err) req.session.error = err;
    res.redirect('/');
  });
});

app.get('/logout', function(req, res) {
  req.session.authed = false;
  req.session.user = null;
  return res.redirect('/');
});

app.post('/register', function(req, res) {
  if(req.body.username && req.body.password && req.body.email) {
    setupdb.get('0', function(err, doc) {
      var authed = false;
      if (err || !doc) {
        setupdb.save('0', {'setup':'0', updated: new Date().getTime()});
        authed = true;
      }
      user_functions.genUser({username: req.body.username, password: req.body.password, email: req.body.email, authorized: authed});
      res.send(200);
    });
  } else {
    res.send(400);
  }
});

app.get('/', function(req, res, next) {
  if (!(user_functions.authorized(req))) {
    res.render('index', {
      error: (req.session && req.session.error) ? req.session.error.message : null,
      bookmarklet: null,
      status: false 
    });
  } else {
    pins.find(function(err, _pins) {
      if (err) throw err;

      var host = 'http://' + req.headers['host'];

      res.render('index', {
        error: null,
        status : req.session.authed,
        bookmarklet: BOOKMARKLET_TEMPLATE.replace(/{{REPLACE_HOST}}/, host).replace(/{{AUTH_TOKEN}}/, req.session.user.auth_code).replace(/[\s]/g, " "),
        pinned: _pins
      });
    });
  }
});

app.error(function(err, req, res, next) {
  if (err instanceof errors.NotFound) {
    res.send(404);
  } else if (err instanceof errors.BadRequest) {
    res.send(400);
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
