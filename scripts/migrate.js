var db = require('../lib/db'),
    pins = new db({'cb': fire, 'collection_name': 'pins', 'key': 'id'}),
    uuid = require('node-uuid');

function fire(pindb) {
	console.log('fire');
  pindb.find({}, function(err, _pins) {
		if (err) throw(err);

		var total = _pins.length;
		var count = 0;
    _pins.forEach(function(pin) {
			var created_on = old_created_on = pin.created_on;
			if (isNaN(created_on)) {
				created_on = pin.updated_on;
			}
			if (isNaN(created_on)) {
				created_on = pin.updated;
			}
			if (created_on instanceof Date) {
				created_on = created_on.getTime();
			}
      pindb.update(pin.id, {'$set': {id: (pin.id || uuid.v4()), created_on: created_on}}, function(err) {
				console.log(pin.id + ": [" + old_created_on + "] to [" + created_on + "].");
				count++;
      });
    });

		function close() {
			if (count == total) {
				pindb.close();
			} else {
				setTimeout(close, 100);
			}
		}

		setTimeout(close, 100);
  });
}
