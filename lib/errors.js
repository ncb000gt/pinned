var util = require('util');

function NotFound(msg) {
  this.name = 'NotFound';
  this.message = msg;
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
util.inherits(NotFound, Error);


function BadRequest(msg) {
  this.name = 'BadRequest';
  this.message = msg;
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}
util.inherits(BadRequest, Error);

module.exports = {
  NotFound: NotFound,
  BadRequest: BadRequest
}
