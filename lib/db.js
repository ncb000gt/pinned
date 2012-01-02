var redis = require('redis');

function DB(opts) {
    this.client = redis.createClient();
}

DB.prototype.add = function(url, fields) {
  if (!fields) fields = {};

  this.client.hset(url, "saved", 1);
  if (fields.tags) this.client.hset(url, "tags", fields.tags);
  if (fields.notes) this.client.hset(url, "notes", fields.notes);
}

DB.prototype.remove = function(url) {
  this.client.del(url);
}

DB.prototype.get = function(url) {
}

DB.prototype.getAll = function(sort, cb) {
  this.client.keys("*", cb);
}

module.exports = function(opts) {
  return new DB(opts);
}
