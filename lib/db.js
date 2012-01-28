var mongo = require('mongodb'),
    mongodb = mongo.Db;

function DB(opts) {
  if (!opts) opts = {};
  var self = this;

  self.db_name = (opts.db_name || 'pinned');
  self.host = (opts.host || 'localhost');
  self.key = (opts.key || 'href');
  self.collection_name = (opts.collection_name || 'collector');
  self.port = (opts.port || mongo.Connection.DEFAULT_PORT);
  self.safe = (opts.safe || false);
  self.username = (opts.username || null);
  self.password = (opts.password || null);

  self.mongodb = new mongodb(self.db_name, new (opts.server || mongo.Server)(self.host, self.port, {}));
  self.mongodb.open(function(err, db) {
    self.db = db;
    if (self.username && self.password) {
      db.authenticate(self.username, self.password, function(err) {
        if (opts.cb) opts.cb(self);
      });
    } else {
      if (opts.cb) opts.cb(self);
    }
  });
}

DB.prototype.save = function(key, fields, cb) {
  if (!fields) fields = {};
  var self = this;
  self._get(key, function(err, doc) {
    if (!doc) doc = {};
    var d = new Date().getTime();
    self.db.collection(self.collection_name, function(err, collection) {
      if (err) console.log(err);

      if (!(doc.created_on)) doc.created_on = d;
      doc.updated_on = d;
      for (var p in fields) doc[p] = fields[p];
      var findObj = {};
      findObj[self.key] = key;
      return collection.update(findObj, doc, {upsert: true, safe: self.safe}, cb);
    });
  });
}

DB.prototype.delete = function(key, cb) {
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    if (err) return cb(err);
    var findObj = {};
    findObj[self.key] = key;
    return collection.remove(findObj, {safe: self.safe}, cb);
  });
}

DB.prototype.get = function(options, cb) {
  if (!options) options = {}
  if (!(options.offset)) options.offset = 0;
  if (!(options.size)) options.size = 10;
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    if (err) return cb(err);
    return collection.find(function(err, cursor) {
      if (err) return cb(err);
      cursor
        .skip(options.offset)
        .limit(options.size)
        .toArray(cb);
    });
  });
}

DB.prototype._get = function(key, cb) {
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    if (err) return cb(err);
    var findObj = {};
    findObj[self.key] = key;
    return collection.findOne(findObj, cb);
  });
}

DB.prototype.close = function(cb) {
  this.db.close();
  if (cb) cb();
}

module.exports = DB;
