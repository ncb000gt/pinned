var bcrypt = require('bcrypt'),
    users = new (require('./users'))(),
    errors = require('./errors');

module.exports = {
  authorize: function(req, res, cb) {
               var un = req.body.username;
               var pw = req.body.password;
               if (un && pw) {
                 users.get(un, function(err, user) {
                   if (!err) {
                     if (user) {
                       bcrypt.compare(pw, user.hash, function(err, ret) {
                         if (err) return cb(new Error(err));

                         if (ret) {
                           req.session.authed = true;
                           req.session.user = user;
                           return cb();
                         } else {
                           return cb(new errors.NotFound('Could not find username and password combination.'));
                         }
                       });
                     } else {
                       return cb(new errors.NotFound('Could not find username and password combination.'));
                     }
                   } else {
                     return cb(new Error(err));
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
