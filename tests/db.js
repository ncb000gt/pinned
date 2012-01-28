var mongo = require('mongodb'),
    pinneddb = require('../lib/db'),
    mongodb = mongo.Db;

function getDB(db_name, cb) {
  var directdb = new mongodb(db_name, new mongo.Server('localhost', mongo.Connection.DEFAULT_PORT, {}));

  directdb.open(cb);
}

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
  save: function(test) {
          test.expect(1);
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
                        //test.deepEqual({test: true}, doc, "Objects should be equal.");

                        testdb.close();
                        test.done();
                      });
                    });
                  });
                });
              }
          });
        }
}
