var express = require('express'),
    fs = require('fs'),
    bcrypt = require('bcrypt'),
    timeago = require('timeago'),
    querystring = require('querystring'),
    uuid = require('node-uuid'),
		_ = require('lodash'),

    mongoDB = require('mongodb').Db,
    mongoServer = require('mongodb').Server,
    sessionServerConfig = new mongoServer('localhost', 27017, {auto_reconnect: true})
    mongodb = new mongoDB('pinned', sessionServerConfig, {}),
    mongostore = require('connect-mongodb'),
    db = require('./lib/db'),
    ObjectId = require('mongodb').ObjectID,
    pins = new db({collection_name: 'pins', key: 'id'}),
		tags = new db({collection_name: 'tags', key: 'id'}),
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

var app = module.exports = express();

app.use(express.bodyParser())
  .use(express.logger('dev'))
  .use(express.cookieParser())
  .use(express.static(__dirname + '/public'))
  .use(express.session({
    cookie: {maxAge: 60000 * 60 * 24},
    secret: "say WUUUUT?!?",
    store: new mongostore({db: mongodb})
  }))
  .use(app.router);
app.set('view engine', 'jade')
app.set('views', __dirname + '/views')

app.get('/setup', setup.get);
app.post('/setup', setup.post);
// app.use('/share', express.router(share));

app.get(/bookmark.js/, function(req, res) {
  var host = 'http://' + req.headers['host'];
  //TODO: consider; per-user auth codes may be a terrible way to go about this task.
  if (req.query && req.query.auth_code) {
    res.set('Content-Type', 'application/javascript');
    return res.send(
      200,
      BOOKMARK_TEMPLATE
        .replace(/{{REPLACE_HOST}}/g, host)
        .replace(/{{AUTH_TOKEN}}/, "'" + req.query.auth_code+ "'")
    );
  }
  return res.send(401);
});

//pin url
app.post('/pin/:pin/read', function(req, res) {
  var pinId = req.params.pin;
  if (pinId) {
    return pins.save({_id: ObjectId(pinId)}, {read: true}, function(err) {
      if (req.headers['x-requested-with'] == 'XMLHttpRequest') return res.send(200);
      return res.redirect('/');
    });
  } else {
    return res.send(404);
  }
});

app.post('/pin', function(req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.body && req.body.token) {
    users.find({'auth_code': req.body.token}, function(err, users) {
      if (!err && users.length > 0) {
        var id = uuid.v4();
        pins.save(id, {
          "id": id,
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
        return res.send("", 200);
      } else {
        return res.send("", 401);
      }
    });
  } else {
    return res.send("", 400);
  }
});

function pinMap(item) {
  var title = item.title;
  if (!title) title = item.href;
  if (title && title.match(/(ht|f)tps?:\/\//)) {
    var s = title.split('/');
    title = s[s.length-1];
    item.title = title;
  }
  item.date = timeago(new Date(item.created_on));

  return item;
}

app.get('/api/:pin/tags', function(req, res) {
	var pinId = req.params.pin;
	if (pinId) {
		return pins.get(pinId, function(err, pin) {
			if (err) return res.send(500, err);

			var tagIds = (pin.tags || []).map(function(tag) {
				return {id: tag};
			});
			return tags.find({"$or": tagIds}, function(err, tags) {
				return res.json(tags);
			});
		});
	} else {
		return res.send(400, "Pin not specified.");
	}
});

app.del('/api/:pin/tags/:tag', function(req, res) {
	var pinId = req.params.pin;
	var tag = req.params.tag;
	//check to see if tag is set to a name...
	return tags.find({name: tag}, function(err, t) {
		if (err) return res.send(500, err);

		function removeTag(tagId) {
			return pins.get(pinId, function(err, pin) {
				var tags = pin.tags;
				var idx = tags.indexOf(tagId);

				if (idx <= 0) {
					//not sure 200 is what we want here...
					return res.send(200);
				} else {
					tags.splice(idx, 1);

					return pins.update(pinId, {"$set": { "tags": tags }}, function(err) {
						if (err) return res.send(500, err);

						return res.send(200);
					});
				}
			});
		}

		if (t && t.length > 0) {
			return removeTag(t[0].id);
		} else {
			return removeTag(tag);
		}
	});
});

app.put('/api/:pin/tags/:tag', function(req, res) {
  var pinId = req.params.pin;
	var tagName = req.params.tag;
  if (pinId && tagName) {
		var tagId = uuid.v4();
		tagName = tagName.toLowerCase();
		return tags.find({name: tagName}, function(err, tag) {

			function up(_tagId) {
				return pins.get(pinId, function(err, p) {
					if (p && p.tags.indexOf(_tagId) > 0) {
						//should this be a 200? probably not.
						return res.send(200);
					}
					return pins.update(pinId, {"$push": {"tags": _tagId}}, function(err) {
						if (err) return res.send(500, err);

						return res.send(200);
					});
				});
			}

			if (!tag || tag.length === 0) {
				return tags.save(tagId, {id: tagId, name: tagName}, function(err) {
					if (err) return res.send(500, err);
					//could just skip this and go to the next line of code, but returns and sends could cause a conflict if there is an error...
					
					return up(tagId);
				});
			} else {
				return up(tag[0].id);
			}
		});
	} else {
		return res.send(400);
	}
});

//get all pins
app.del('/api/pins/:pin', function(req, res) {
  var pinId = req.params.pin;
  if (pinId) {
    return pins.bulkDelete({id: pinId}, function(err) {
      if (err) return res.send(500, err);

      return res.send();
    });
  } else {
    return res.send(404);
  }
});

app.get('/api/tags', function(req, res) {
	return tags.find({}, function(err, tags) {
		return res.json(tags);
	});
});

app.get('/api/pins', function(req, res) {
  var offset = req.query.offset,
      size = req.query.size,
			tagNames = req.query.tags;

  var findObj = {};
  if (offset || offset === 0) findObj.skip = offset;
  if (size) findObj.limit = size;
	function go(filter) {
		return pins.page(filter, findObj, function(err, _pins) {
			return pins.count(filter, function(err, count) {
				return res.json({
					"total": count,
				  "results": _pins.map(pinMap)
				});
			});
		});
	}

	if (tagNames) {
		return tags.find({'$or': tagNames.map(function(tag) {
			return {"name": tag};
		})}, function(err, _tags) {
			if (err) return res.send(500, err);

			return go({"tags": {"$in": _.pluck(_tags, 'id')}});
		});
	} else {
		return go({});
	}
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
      if (req.headers['x-requested-with'] == 'XMLHttpRequest') return res.send(200);
      return res.redirect('/');
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
    pins.find(findObj, function(err, _pins) {
      if (err) throw err;

      var host = 'http://' + req.headers['host'];

			tags.find({}, function(err, _tags) {
				res.render('index', {
					error: null,
					status: req.session.authed,
					bookmarklet: BOOKMARKLET_TEMPLATE.replace(/{{REPLACE_HOST}}/, host).replace(/{{AUTH_TOKEN}}/, req.session.user.auth_code).replace(/[\s]/g, " "),
					pinned: _pins.map(pinMap),
					tags: _tags
				});
      });
    });
  }
});

//app.error(function(err, req, res, next) {
  //if (err instanceof errors.NotFound) {
    //res.send(404);
  //} else if (err instanceof errors.BadRequest) {
    //res.send(400);
  //} else {
    //next(err);
  //}
//});

var port = (process.env.NODE_PORT || (process.env.NODE_ENV === 'production' ? 80 : 8000)); 

app.listen(port);

console.log('Server listening on ' + port);

process.on("exit", function() {
  console.log("Shutdown Server.");
});

process.on("SIGINT", function() {
  console.log("Server interupted.");
  process.exit(0);
});
