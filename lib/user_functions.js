var bcrypt = require('bcrypt'),
    users = new (require('./dbs/users'))(),
    errors = require('./errors');

var nfm = 'Could not find username and password combination.';

module.exports = {
  'authorize': function(req, res, cb) {
    var un = req.body.username;
    var pw = req.body.password;
    if (un && pw) {
      users.find({username: un, authorized: true}, function(err, users) {
        if (!err) {
          if (users.length > 0) {
            var user = users[0];
            if (user) {
              bcrypt.compare(pw, user.hash, function(err, ret) {
                if (err) return cb(new Error(err));

                if (ret) {
                  req.session.authed = true;
                  req.session.user = user;
                  return cb();
                } else {
                  return cb(new errors.NotFound(nfm));
                }
              });
            } else {
              return cb(new errors.NotFound(nfm));
            }
          } else {
            return cb(new errors.NotFound(nfm));
          }
        } else {
          return cb(new Error(err));
        }
      });
    } else {
      return cb(new errors.BadRequest('Invalid credentials.'));
    }
  },
  'authorized': function(req) {
    return req.session && req.session.authed;
  },
  'genUser': function(data, cb) {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(data.password, salt, function(err, hash) {
        users.save(data.username, {username: data.username, hash: hash, email: data.email, authorized: data.authorized});
        if (cb) cb();
      });
    });
  },
  'userExists': function(username) {
  }
}
