var mongo = require('mongodb'),
    mongodb = mongo.Db,
    DB_NAME = 'pinned',
    COLLECTION_NAME = 'pins';

function DB(opts, cb) {
  if (!opts) opts = {};

  var self = this;
  self.mongodb = new mongodb(DB_NAME, new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}));
  self.mongodb.open(function(err, db) {
    self.db = db;

    if (cb && typeof(cb) == 'function') {
      if (err) return cb(err);
      return cb(null, self);
    }
  });
}

DB.prototype.addOrUpdate = function(url, fields) {
  if (!fields) fields = {};
  var self = this;

  self._get(url, function(err, doc) {
    if (!doc) doc = {};
    var d = new Date().getTime();
    self.db.collection(COLLECTION_NAME, function(err, collection) {
      if (err) return cb(err);

      if (!(doc.saved)) doc.saved = d;
      if (!(doc.url)) doc.url = url;
      doc.updated = d;
      if (fields.stars) doc.stars = fields.stars;
      if (fields.tags) doc.tags = fields.tags;
      if (fields.category) doc.category = fields.category;
      if (fields.annotate) doc.annotate = fields.annotate;

      return collection.update({url: url}, doc, {upsert: true});
    });
  });
}

DB.prototype.getAll = function(options, cb) {
  if (!options) options = {}
  if (!(options.offset)) options.offset = 0;
  if (!(options.size)) options.size = 10;
  var self = this;

  self.db.collection(COLLECTION_NAME, function(err, collection) {
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

DB.prototype._get = function(url, cb) {
  var self = this;
  self.db.collection(COLLECTION_NAME, function(err, collection) {
    if (err) return cb(err);

    return collection.findOne({url: url}, cb);
  });
}

module.exports = function(opts, cb) {
  return new DB(opts, cb);
}
