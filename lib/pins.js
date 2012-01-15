var util = require('util'),
    db = require('./db');

function Pins(opts) {
  db.call(this, opts);

  var self = this;
  self.collection_name = (opts.collection_name || 'pins');
}
util.inherits(Pins, db);

module.exports = Pins;
