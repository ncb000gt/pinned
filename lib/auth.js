var bcrypt = require('bcrypt'),
    users = new (require('./users'))(),
    errors = require('./errors');

module.exports = {
  authorize: function(req, res, cb) {
               var un = req.body.username;
               var pw = req.body.password;
               if (un && pw) {
                 users.get(un, function(err, user) {
                   if (!err && user && bcrypt.compareSync(pw, user.hash)) {
                     req.session.authed = true;
                     return cb();
                   } else if (err) {
                     return cb(new Error(err));
                   } else {
                     return cb(new errors.NotFound('Username and password combo not found.'));
                   }
                 });
               } else {
                 return cb(new errors.BadRequest('Invalid credentials.'));
               }
             },
  authorized: function(req) {
    return req.session && req.session.authed;
  }
}
