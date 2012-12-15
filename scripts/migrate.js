var db = require('./lib/db'),
    pins = new db({'cb': fire, 'key': 'id'}),
    uuid = require('node-uuid');

function fire() {
  pins.find({}, {}, function(err, _pins) {
    _pins.forEach(function(pin) {
			var created_on = pin.created_on;
			if (isNaN(created_on)) {
				created_on = pin.updated_on;
			}
			if (isNaN(created_on)) {
				created_on = pin.updated;
			}
      pins.update(pin.href, {'$set': {id: (pin.id || uuid.v4()), created_on: created_on}}, function(err) {
      });
    });
    pins.close();
  });
}
