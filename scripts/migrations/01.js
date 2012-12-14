#!/usr/bin/env node

var mongo = require('mongodb'),
    mongodb = mongo.Db,
		uuid = require('node-uuid');

var db = new mongodb('pinned', new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}));

db.open(function(err, db) {
	console.log(err);
	db.collection('pins', function(err, pc) {
		db.collection('tags', function(err, tc) {
			pc.find(function(err, cursor) {
				cursor.toArray(function(err, pins) {
					var count = 0;
					var len = pins.length;
					for (var i = 0; i < len; i++) {
						var pin = pins[i];
						var findObj = {href: pin.href};

						var tagIds = [];
						if (pin.tags && pin.tags.length > 0) {
							len += pin.tags.length;
							for (var j = 0; j < pin.tags.length; j++) {
								var tagName = pin.tags[j].toLowerCase();
								tc.find({name: tagName}, function(err, tagcursor) {
									tagcursor.toArray(function(err, tags) {
										if (tags && tags.length > 0) {
											tagIds.push(tags[0].id);
											count++;
										} else {
											var tagId = uuid.v4();
											tagIds.push(tagId);
											tc.save(tagId, {id: tagId, name: tagName}, function(err) {
												console.log(' TAG: created - ' + tagName + ':' + tagId);
												count++;
											});
										}
									});
								});
							}
						}

						var alter = {'$set': {'tags': tagIds}};
						pc.update(findObj, alter, {upsert: true}, function(err) {
							console.log(' PIN: updated - ' + pin.href + ' - ' + tagIds.join(','));
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
});
