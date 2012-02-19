var mongo = require('mongodb'),
    mongodb = mongo.Db;

function getDB(db_name, cb) {
  var directdb = new mongodb(db_name, new mongo.Server("staff.mongohq.com", 10072, mongo.Connection.DEFAULT_PORT, {}));

  directdb.open(function(err, db) {
    db.authenticate("pinned", "pinned", function(err) {
      cb(err, db);
    });
  });
}

module.exports = {
  'setUpDB': function(cb) {
    var self = this;

    self.db_name = "pinned";
    self.collection_name = "test-" + new Date().getTime();
    self.host = "staff.mongohq.com";
    self.port = 10072;
    self.username = "pinned";
    self.password = "pinned";

    getDB(self.db_name, function(err, directdb) {
      self.directdb = directdb;
      cb();
    });
  },
  'tearDownDB': function(cb) {
    var self = this;

    if (self.directdb) {
      self.directdb.dropCollection(self.collection_name, function() {
        self.directdb.close();
        cb();
      });
    }
  }
};
