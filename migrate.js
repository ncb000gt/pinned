var db = require('./lib/db'),
    pins = new (require('./lib/dbs/pins'))({'cb': fire, 'key': 'href'}),
    uuid = require('node-uuid');

function fire() {
  pins.find({}, {}, function(err, _pins) {
    _pins.forEach(function(pin) {
      pins.update(pin.href, {'$set': {id: uuid.v4()}}, function(err) {
      });
    });
    pins.close();
  });
}
