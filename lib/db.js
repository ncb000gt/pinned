var redis = require('redis');

function DB(opts) {
    this.client = redis.createClient();
}

DB.prototype.add = function(url, fields) {
  if (!fields) fields = {};
  var self = this;

  this.client.hget(url, "saved", function(err, value) {
    if (err || !value) {
      self.client.hset(url, "saved", new Date().getTime());
      self.client.hset(url, "url", url);
    }
    self.client.hset(url, "updated", new Date().getTime());
  });

  this.star(url, fields.stars);
  this.tag(url, fields.tags);
  this.category(url, fields.category);
  this.annotate(url, fields.annotate);
}

DB.prototype.star = function(url, stars) {
  if (stars) this.client.hset(url, "stars", stars);
}

DB.prototype.category = function(url, category) {
  if (category) this.client.hset(url, "category", category);
}

DB.prototype.tag = function(url, tags) {
  if (tags) this.client.hset(url, "tags", tags);
}

DB.prototype.annotate = function(url, notes) {
  if (notes) this.client.hset(url, "notes", notes);
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
