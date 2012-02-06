var util = require('util'),
    uuid = require('node-uuid'),
    db = require('../db');

function Users(opts) {
  if (!opts) opts = {};
  db.call(this, opts);

  var self = this;
  self.collection_name = (opts.collection_name || 'users');
  self.key = (opts.key || 'username');
}
util.inherits(Users, db);

Users.prototype.checkAndAddProperties = function(doc, cb) {
  if (!(doc.auth_code)) {
    doc.auth_code = uuid.v4();
  }

  return cb(doc);
}

module.exports = Users;
