var bcrypt = require('bcrypt'),
    db = require('./db'),
    users = new (require('./dbs/users'))(),
    setupdb = new db({key: 'setup', collection_name: 'setup'});

module.exports = function(app) {
  app.get('/', function(req, res) {
  });

  app.post('/', function(req, res) {
    var un = req.body.username;
    var pw = req.body.password;
    var email = req.body.email;

    setupdb.get('0', function(err, setup) {
      if (!err && setup) {
        res.send(403);
      } else if (!err) {
        setupdb.save('0', {'setup':'0', 'updated': []});
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(pw, salt, function(err, hash) {
            users.save(un, {username: un, hash: hash, email: email});
            res.send(200);
          });
        });
      } else {
        console.log(err);
        res.send(500);
      }
    });
  });
}
