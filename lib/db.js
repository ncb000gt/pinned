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

DB.prototype.save = function() {
  return this._save.apply(this, arguments);
}

DB.prototype._save = function(key, fields, cb) {
  if (!fields) fields = {};
  var self = this;
  self.get(key, function(err, doc) {
    if (!doc) doc = {};
    var d = new Date().getTime();
    self.db.collection(self.collection_name, function(err, collection) {
      if (err) console.log(err);

      if (!(doc.created_on)) doc.created_on = d;
      doc.updated_on = d;
      for (var p in fields) doc[p] = fields[p];
      var findObj = {};
      findObj[self.key] = key;

      function update(doc) {
        return collection.update(findObj, doc, {upsert: true, safe: self.safe}, cb);
      }
      if (self.checkAndAddProperties) return self.checkAndAddProperties(doc, update);
      return update(doc);
    });
  });
}

DB.prototype.delete = function() {
  return this._delete.apply(this, arguments);
}

DB.prototype._delete = function(key, cb) {
  var findObj = {};
  var self = this;
  findObj[self.key] = key;
  return this.buildDelete(findObj, cb);
}

DB.prototype.bulkDelete = function() {
  return this._bulkDelete.apply(this, arguments);
}

DB.prototype._bulkDelete = function(filter, cb) {
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    if (err) return cb(err);

    return collection.remove(filter, {safe: self.safe}, cb);
  });
}

DB.prototype.page = function() {
  return this._find.apply(this, arguments);
}

DB.prototype._page = function(options, cb) {
  if (!options) options = {}
  if (!(options.skip) || options.skip === 0) options.skip = 0;
  if (!(options.limit)) options.limit = 10;
  return this.find({}, options, cb);
}

DB.prototype.find = function() {
  this._find.apply(this, arguments);
}

DB.prototype._find = function(filter, options, cb) {
  if (typeof filter == "function") {
    cb = filter;
    filter = {};
  } else if (typeof options == "function") {
    cb = options;
    options = {};
  }
  if (!options) options = {}
  if (filter && typeof filter == "string") {
    var _filter = {};
    _filter[this.key] = filter;
    filter = _filter;

  }
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    if (err) return cb(err);
    return collection.find(filter, options, function(err, cursor) {
      return cursor.toArray(cb);
    });
  });
}

DB.prototype.mr = function() {
  return this._mr.apply(this, arguments);
}

DB.prototype._mr = function(keys, filter, initState, reducePhase, cb) {
  var self = this;
  self.db.collection(self.collection_name, function(err, collection) {
    collection.group(keys, filter, initState, reducePhase, cb);
  });
}

DB.prototype.get = function() {
  return this._get.apply(this, arguments);
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

DB.prototype.close = function() {
  return this._close.apply(this, arguments);
}

DB.prototype._close = function(cb) {
  this.db.close();
  if (cb) return cb();
}

module.exports = DB;
