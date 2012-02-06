#!/usr/bin/env node

var mongo = require('mongodb'),
    mongodb = mongo.Db;

var db = new mongodb('pinned', new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}));

db.open(function(err, db) {
  db.collection('pins', function(err, collection) {
    collection.find(function(err, cursor) {
      cursor.toArray(function(err, pins) {
        var count = 0;
        var len = pins.length;
        for (var i = 0; i < len; i++) {
          var pin = pins[i];
          var findObj = {url: pin.url};
          pin.href = pin.url;
          pin.show = true;
          pin.title = pin.url;
          collection.update(findObj, pin, {upsert: true}, function(err) {
            count++;
          });

        }

        function check() {
          if (count === len) {
            console.log('Done.');
            db.close();
          } else {
            setTimeout(check, 100);
          }
        }

        setTimeout(check, 100);
      });
    });
  });
});
