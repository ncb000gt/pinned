var express = require('express'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    timeago = require('timeago'),
    querystring = require('querystring'),
    db = require('./lib/db'),
    ObjectId = require('mongodb').ObjectID,
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
app.post('/pin/:pin/tag', function(req, res) {
  var pinId = req.params.pin;
  var tags = req.body.tags;
  if (pinId) {
    return pins.save({_id: ObjectId(pinId)}, {tags: tags.split(',')}, function(err) {
      if (req.headers['x-requested-with'] == 'XMLHttpRequest') return res.send(200);
      return res.redirect('/');
    });
  } else {
    return res.send(404);
  }
});

app.get('/pin/:pin/delete', function(req, res) {
  var pinId = req.params.pin;
  if (pinId) {
    return pins.bulkDelete({_id: ObjectId(pinId)}, function(err) {
      if (req.headers['x-requested-with'] == 'XMLHttpRequest') return res.send(200);
      return res.redirect('/');
    });
  } else {
    return res.send(404);
  }
});

app.post('/pin', function(req, res) {
  if (req.body && req.body.token) {
    users.find({'auth_code': req.body.token}, function(err, users) {
      if (!err && users.length > 0) {
        pins.save(req.body.href, { 
          "href": req.body.href,
          "title" : req.body.title,
          "domain" : req.body.domain,
          "target" : req.body.target || "_blank",
          "image" : req.body.image || false,
          "show" : req.body.show || true,
          "username": users[0].username
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

function pinMap(item) {
  var title = item.title;
  if (!title) title = item.href;
  if (title && title.match(/https?:\/\//)) {
    var s = title.split('/');
    title = s[s.length-1];
    item.title = title;
  }
  item.date = timeago(new Date(item.created_on));

  return item;
}
//get all pins
app.get('/pins', function(req, res){
  var offset = req.query.offset,
      size = req.query.size;

  var findObj = {};
  if (offset || offset === 0) findObj.skip = offset;
  if (size) findObj.limit = size;
  pins.find({}, findObj, function(err, pins) {
    res.json(pins.map(pinMap));
  });
});

app.get('/login', function(req, res) {
  return res.render('login', {
    error: (req.session && req.session.error) ? req.session.error.message : null,
    bookmarklet: null,
    status: false 
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

app.get('/register', function(req, res) {
  return res.render('register', {
    error: (req.session && req.session.error) ? req.session.error.message : null,
    bookmarklet: null,
    status: false 
  });
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
    res.redirect('/login');
  } else {
    var qtags = req.query.tags;
    var findObj = {};
    if (qtags) {
      if (qtags[qtags.length-1] == ',') qtags = qtags.substring(0, qtags.length-2);
      qtags = qtags.split(',');
      findObj.tags = { $in: qtags };
    }
    pins.find(findObj, {},function(err, _pins) {
      if (err) throw err;

      var host = 'http://' + req.headers['host'];

      pins.find({}, {fields: ['tags']}, function(err, tags) {
        //consider a separate collection of tags just for this purpose...?
        //bad approach if large separate arrays of tags...
        if (tags.length < 2) tags.push(''); //artificially push to make sure we reduce 

        tags = tags.reduce(function(a, b) {
          a = a.tags || [];
          b = b.tags || [];

          if (typeof(a) == 'string') a = [a];
          if (typeof(b) == 'string') b = [b];

          for (var i = 0; i < b.length; i++) {
            if (a.indexOf(b[i]) < 0) a.push(b[i]);
          }

          return a;
        });
        tags = tags.map(function(tag) {
          var ntags = (qtags || []).map(function(tag) { return tag; });
          tag = {value: tag};
          tag.url = req.path;
          var q = {};
          for (var p in req.query) {
            q[p] = req.query[p];
          }

          var tagidx = -1;
          if (qtags && (tagidx = qtags.indexOf(tag.value)) >= 0) {
            tag.selected = true;
            ntags.splice(tagidx, 1);
          } else {
            if (!ntags) ntags = [];
            ntags.push(tag.value);
          }
          if (ntags && ntags.length > 0) {
            q.tags = ntags.join(',');
          } else {
            delete q.tags;
          }
          var qstring = querystring.stringify(q);
          if (qstring) tag.url += '?' + qstring;
          return tag;
        });

        res.render('index', {
          error: null,
          status: req.session.authed,
          bookmarklet: BOOKMARKLET_TEMPLATE.replace(/{{REPLACE_HOST}}/, host).replace(/{{AUTH_TOKEN}}/, req.session.user.auth_code).replace(/[\s]/g, " "),
          pinned: _pins.map(pinMap),
          tags: tags
        });
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
