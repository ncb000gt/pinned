var util = require('util'),
    db = require('../db');

function Pins(opts) {
  if (!opts) opts = {};
  db.call(this, opts);

  var self = this;
  self.collection_name = (opts.collection_name || 'pins');
  self.key = (opts.key || 'href');
}
util.inherits(Pins, db);

module.exports = Pins;
