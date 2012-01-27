var mongo = require('mongodb'),
    mongodb = mongo.Db;

function DB(opts) {
  if (!opts) opts = {};
  var self = this;

  self.db_name = (opts.db_name || 'pinned');
  self.host = (opts.host || 'localhost');
  self.key = (opts.key || 'href');
  self.port = (opts.port || mongo.Connection.DEFAULT_PORT);

  self.mongodb = new mongodb(self.db_name, new (opts.server || mongo.Server)(self.host, self.port, {}));
  self.mongodb.open(function(err, db) {
    self.db = db;
  });
}

DB.prototype.post = function(key, fields) {
  if (!fields) fields = {};
  var self = this;
  self._get(key, function(err, doc) {
    if (!doc) doc = {};
    var d = new Date().getTime();
    self.db.collection(self.collection_name, function(err, collection) {
      if (err) return cb(err);

      if (!(doc.created_on)) doc.created_on = d; 
      doc.updated = d;
      for (var p in fields) doc[p] = fields[p];
      var findObj = {};
      findObj[self.key] = key;
      return collection.update(findObj, doc, {upsert: true});
    });
  });
}

DB.prototype.delete = function(key, cb) {
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    if (err) return cb(err);
    var findObj = {};
    findObj[self.key] = key;
    return collection.remove(findObj, cb);
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

module.exports = DB;
