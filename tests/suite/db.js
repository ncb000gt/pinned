var utils = require('../utils'),
    pinneddb = require('../../lib/db');

//Must have the appropriate datastore in order to run these.
//Also, must be running on default ports.
module.exports = {
  'setUp': function(cb) {
    utils.setUpDB.call(this, cb);
  },
  'tearDown': function(cb) {
    utils.tearDownDB.call(this, cb);
  },
  "custom initialization": function(test) {
          test.expect(6);
          var self = this;

          new pinneddb({
              key: 'test',
              db_name: self.db_name,
              collection_name: self.collection_name,
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                test.equal(testdb.db_name, self.db_name, "DB name should be set to '"+self.db_name+"'.");
                test.equal(testdb.key, "test", "The key should be set to 'test'.");
                test.equal(testdb.collection_name, self.collection_name, "Collection name should be set to '"+self.collection_name+"'.");
                test.equal(testdb.host, self.host, "Host should be set to '"+self.host+"'.");
                test.equal(testdb.port, self.port, "Port should be set to '"+self.port+"'.");
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
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
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
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
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
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  testdb.get("test", function(err, doc) {
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
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert({"test": "test"}, {safe: true}, function(err) {
                    testdb.get("test", function(err, doc) {
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
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert([{"test": "test1"}, {"test": "test2"}], {safe: true}, function(err) {
                    testdb.get("test1", function(err, doc) {
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
  "find one of none": function(test) {
          test.expect(3);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  testdb.find({"test": "test"}, function(err, docs) {
                    test.ok(!err, "There should be no error.");
                    test.ok(docs, "Docs should not be null/undefined.");
                    test.equal(docs.length, 0, "Docs should have no items.");

                    testdb.close();
                    test.done();
                  });
                });
              }
          });
        },
  "find one": function(test) {
          test.expect(3);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert({"test": "test"}, {safe: true}, function(err) {
                    testdb.find({"test":"test"}, function(err, docs) {
                      test.ok(!err, "There should be no error.");
                      test.ok(docs, "Docs should not be null/undefined.");
                      test.equal(docs.length, 1, "Docs should have 1 item.");

                      testdb.close();
                      test.done();
                    });
                  });
                });
              }
          });
        },
  "find one of many": function(test) {
          test.expect(4);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert([{"test": "test1"}, {"test": "test2"}], {safe: true}, function(err) {
                    testdb.find({"test": "test1"}, function(err, docs) {
                      test.ok(!err, "There should be no error.");
                      test.ok(docs, "Docs should not be null/undefined.");
                      test.equal(docs.length, 1, "Docs should have 1 item.");
                      var doc = docs[0];
                      test.equal(doc[testdb.key], "test1", "Document key should exist.");

                      testdb.close();
                      test.done();
                    });
                  });
                });
              }
          });
        },
  "find one of many using string filter": function(test) {
          test.expect(4);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert([{"test": "test1"}, {"test": "test2"}], {safe: true}, function(err) {
                    testdb.find("test1", function(err, docs) {
                      test.ok(!err, "There should be no error.");
                      test.ok(docs, "Docs should not be null/undefined.");
                      test.equal(docs.length, 1, "Docs should have 1 item.");
                      var doc = docs[0];
                      test.equal(doc[testdb.key], "test1", "Document key should exist.");

                      testdb.close();
                      test.done();
                    });
                  });
                });
              }
          });
        },
  "find many of many": function(test) {
          test.expect(3);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert([{"test": "test1"}, {"test": "test2"}, {"test":"test1"}], {safe: true}, function(err) {
                    testdb.find({"test":"test1"}, function(err, docs) {
                      test.ok(!err, "There should be no error.");
                      test.ok(docs, "Docs should not be null/undefined.");
                      test.equal(docs.length, 2, "Docs should have 2 item.");

                      testdb.close();
                      test.done();
                    });
                  });
                });
              }
          });
        },
  "find all of many": function(test) {
          test.expect(3);
          var self = this;

          new pinneddb({
              key: "test",
              db_name: self.db_name,
              collection_name: self.collection_name,
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
              safe: true,
              cb: function(testdb) {
                self.directdb.collection(testdb.collection_name, function(err, collection) {
                  collection.insert([{"test": "test1"}, {"test": "test2"}, {"test":"test1"}], {safe: true}, function(err) {
                    testdb.find(function(err, docs) {
                      test.ok(!err, "There should be no error.");
                      test.ok(docs, "Docs should not be null/undefined.");
                      test.equal(docs.length, 3, "Docs should have 3 item.");

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
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
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
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
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
              host: self.host,
              port: self.port,
              username: self.username,
              password: self.password,
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
