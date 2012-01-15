var mongo = require('mongodb'),
    mongodb = mongo.Db;

function DB(opts) {
  if (!opts) opts = {};
  var self = this;

  self.db_name = (opts.db_name || 'pinned');
  self.host = (opts.host || 'localhost');
  self.port = (opts.port || mongo.Connection.DEFAULT_PORT);

  self.mongodb = new mongodb(self.db_name, new (opts.server || mongo.Server)(self.host, self.port, {}));
  self.mongodb.open(function(err, db) {
    self.db = db;
  });
}

DB.prototype.addOrUpdate = function(url, fields) {
  if (!fields) fields = {};
  var self = this;

  self._get(url, function(err, doc) {
    if (!doc) doc = {};
    var d = new Date().getTime();
    self.db.collection(self.collection_name, function(err, collection) {
      if (err) return cb(err);

      doc.updated = d;
      if (!(doc.saved)) doc.saved = d;
      if (!(doc.url)) doc.url = url;

      for (var p in fields) {
        doc[p] = fields[p];
      }

      return collection.update({url: url}, doc, {upsert: true});
    });
  });
}

DB.prototype.remove = function(url, cb) {
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    if (err) return cb(err);

    return collection.remove({url: url}, cb);
  });
}

DB.prototype.getAll = function(options, cb) {
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

DB.prototype._get = function(url, cb) {
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    if (err) return cb(err);

    return collection.findOne({url: url}, cb);
  });
}

module.exports = DB;
