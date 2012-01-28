var mongo = require('mongodb'),
    pinneddb = require('../lib/db'),
    mongodb = mongo.Db;

function getDB(db_name, cb) {
  var directdb = new mongodb(db_name, new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}));

  directdb.open(cb);
}

//Must have the appropriate datastore in order to run these.
//Also, must be running on default ports.
module.exports = {
  setUp: function(cb) {
           var self = this;

           self.db_name = "pinned-test-" + new Date().getTime();

           getDB(self.db_name, function(err, directdb) {
             self.directdb = directdb;
             cb();
           });
         },
  tearDown: function(cb) {
              var self = this;

              if (self.directdb) {
                self.directdb.dropDatabase(function() {
                  self.directdb.close();
                  cb();
                });
              }
            },
  "default initialization": function(test) {
          test.expect(5);
          var self = this;

          new pinneddb({
              cb: function(testdb) {
                test.equal(testdb.db_name, "pinned", "DB name should default to 'pinned'.");
                test.equal(testdb.key, "href", "The key should default to 'test'.");
                test.equal(testdb.collection_name, "collector", "Collection name should default to 'collector'.");
                test.equal(testdb.host, "localhost", "Host should default to 'localhost'.");
                test.equal(testdb.port, mongo.Connection.DEFAULT_PORT, "Port should default to '" + mongo.Connection.DEFAULT_PORT + "'.");

                testdb.close();
                test.done();
              }
          });
        },
  "custom initialization": function(test) {
          test.expect(5);
          var self = this;

          new pinneddb({
              key: 'test',
              db_name: 'test',
              collection_name: 'test',
              host: '127.0.0.1',
              port: 27017,
              cb: function(testdb) {
                test.equal(testdb.db_name, "test", "DB name should be set to 'pinned'.");
                test.equal(testdb.key, "test", "The key should be set to 'test'.");
                test.equal(testdb.collection_name, "test", "Collection name should be set to 'collector'.");
                test.equal(testdb.host, "127.0.0.1", "Host should be set to 'localhost'.");
                test.equal(testdb.port, 27017, "Port should be set to '10'.");

                testdb.close();
                test.done();
              }
          });
        },
  save: function(test) {
          test.expect(4);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              cb: function(testdb) {
                testdb.save("test", {"test": "test"}, function(err) {
                  //check with directdb
                  self.directdb.collection(testdb.collection_name, function(err, collection) {
                    collection.find(function(err, cursor) {
                      cursor.toArray(function(err, docs) {
                        test.equal(docs.length, 1, "Should have stored 1 document.");
                        var doc = docs[0];
                        test.ok(doc.created_on, "Created date should exist.");
                        test.ok(doc.updated_on, "Updated date should exist.");
                        test.equal(doc[testdb.key], "test", "Document key should exist.");

                        testdb.close();
                        test.done();
                      });
                    });
                  });
                });
              }
          });
        },
  update: function(test) {
          test.expect(7);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              cb: function(testdb) {
                testdb.save("test", {"test": "test", "new1": "old"}, function(err) {
                  self.directdb.collection(testdb.collection_name, function(err, collection) {
                    collection.find(function(err, cursor) {
                      cursor.toArray(function(err, docs) {
                        test.equal(docs.length, 1, "Should have stored 1 document.");

                        var doc = docs[0];
                        test.equal(doc.new1, "old", "New field should equal value.");

                        testdb.save("test", {"test": "test", "new1": "new"}, function(err) {
                          //check with directdb
                          self.directdb.collection(testdb.collection_name, function(err, collection) {
                            collection.find(function(err, cursor) {
                              cursor.toArray(function(err, docs) {
                                test.equal(docs.length, 1, "Should have stored 1 document.");
                                var doc = docs[0];
                                test.ok(doc.created_on, "Created date should exist.");
                                test.ok(doc.updated_on, "Updated date should exist.");
                                test.equal(doc[testdb.key], "test", "Document key should exist.");
                                test.equal(doc.new1, "new", "New field should equal value.");

                                testdb.close();
                                test.done();
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              }
          });
        }
}
