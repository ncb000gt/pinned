var util = require('util'),
    db = require('./db');

function Users(opts) {
  if (!opts) opts = {};
  db.call(this, opts);

  var self = this;
  self.collection_name = (opts.collection_name || 'users');
  self.key = (opts.key || 'username');
}
util.inherits(Users, db);

module.exports = Users;
