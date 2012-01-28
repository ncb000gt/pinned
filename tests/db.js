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

           self.db_name = "pinned";
           self.collection_name = "test-" + new Date().getTime();

           getDB(self.db_name, function(err, directdb) {
             self.directdb = directdb;
             cb();
           });
         },
  tearDown: function(cb) {
              var self = this;

              if (self.directdb) {
                self.directdb.dropCollection(self.collection_name, function() {
                  self.directdb.close();
                  cb();
                });
              }
            },
  "default initialization": function(test) {
          test.expect(6);
          var self = this;

          new pinneddb({
              db_name: self.db_name,
              collection_name: self.collection_name,
              cb: function(testdb) {
                test.equal(testdb.db_name, self.db_name, "DB name should default to '"+self.db_name+"'.");
                test.equal(testdb.key, "href", "The key should default to 'test'.");
                test.equal(testdb.collection_name, self.collection_name, "Collection name should default to '"+self.collection_name+"'.");
                test.equal(testdb.host, "localhost", "Host should default to 'localhost'.");
                test.equal(testdb.port, mongo.Connection.DEFAULT_PORT, "Port should default to '" + mongo.Connection.DEFAULT_PORT + "'.");
                test.equal(testdb.safe, false, "Safe should default to 'false'.");

                testdb.close();
                test.done();
              }
          });
        },
  "custom initialization": function(test) {
          test.expect(6);
          var self = this;

          new pinneddb({
              key: 'test',
              db_name: self.db_name,
              collection_name: self.collection_name,
              host: '127.0.0.1',
              port: 27017,
              safe: true,
              cb: function(testdb) {
                test.equal(testdb.db_name, self.db_name, "DB name should be set to '"+self.db_name+"'.");
                test.equal(testdb.key, "test", "The key should be set to 'test'.");
                test.equal(testdb.collection_name, self.collection_name, "Collection name should be set to '"+self.collection_name+"'.");
                test.equal(testdb.host, "127.0.0.1", "Host should be set to 'localhost'.");
                test.equal(testdb.port, 27017, "Port should be set to '10'.");
                test.equal(testdb.safe, true, "Safe should be set to 'true'.");

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
              collection_name: self.collection_name,
              safe: true,
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
              collection_name: self.collection_name,
              safe: true,
              cb: function(testdb) {
                testdb.save("test", {"test": "test", "new1": "old"}, function(err) {
                  self.directdb.collection(testdb.collection_name, function(err, collection) {
                    collection.find(function(err, cursor) {
                      cursor.toArray(function(err, docs) {
                        test.equal(docs.length, 1, "Should have stored 1 document.");

                        var doc = docs[0];
                        test.equal(doc.new1, "old", "New field should be set to 'old'.");

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
                                test.equal(doc.new1, "new", "New field should be set to 'new'.");

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
        },
  "get one of none": function(test) {
          test.expect(2);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  testdb._get("test", function(err, doc) {
                    test.ok(!err, "There should be no error.");
                    test.ok(!doc, "Document should be empty.");

                    testdb.close();
                    test.done();
                  });
                });
              }
          });
        },
  "get one": function(test) {
          test.expect(2);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert({"test": "test"}, {safe: true}, function(err) {
                    testdb._get("test", function(err, doc) {
                      test.ok(!err, "There should be no error.");
                      test.equal(doc[testdb.key], "test", "Document key should exist.");

                      testdb.close();
                      test.done();
                    });
                  });
                });
              }
          });
        },
  "get one of many": function(test) {
          test.expect(2);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert([{"test": "test1"}, {"test": "test2"}], {safe: true}, function(err) {
                    testdb._get("test1", function(err, doc) {
                      test.ok(!err, "There should be no error.");
                      test.equal(doc[testdb.key], "test1", "Document key should exist.");

                      testdb.close();
                      test.done();
                    });
                  });
                });
              }
          });
        },
  "delete one of none": function(test) {
          test.expect(1);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  testdb.delete("test", function(err) {
                    test.ok(!err, "There should be no error.");

                    testdb.close();
                    test.done();
                  });
                });
              }
          });
        },
  "delete one": function(test) {
          test.expect(3);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert({"test": "test"}, {safe: true}, function(err) {
                    testdb.delete("test", function(err) {
                      test.ok(!err, "There should be no error.");
                      collection.findOne({"test": "test"}, function(err, doc) {
                        test.ok(!err, "There should be no error.");
                        test.ok(!doc, "There should be no doc.");


                        testdb.close();
                        test.done();
                      });
                    });
                  });
                });
              }
          });
        },
  "delete one of many": function(test) {
          test.expect(4);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              safe: true,
              collection_name: self.collection_name,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert([{"test": "test1"}, {"test": "test2"}], {safe: true}, function(err) {
                    testdb.delete("test1", function(err) {
                      test.ok(!err, "There should be no error.");
                      collection.findOne({"test": "test1"}, function(err, doc) {
                        test.ok(!err, "There should be no error.");
                        test.ok(!doc, "There should be no doc.");

                        collection.findOne({"test": "test2"}, function(err, doc) {
                          test.equal(doc[testdb.key], "test2", "Document key should exist.");
                          testdb.close();
                          test.done();
                        });
                      });
                    });
                  });
                });
              }
          });
        }
}
