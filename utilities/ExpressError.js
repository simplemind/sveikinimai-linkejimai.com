// A class extending the native Express Error handler
// naming with a capital letter to indicate a class
class ExpressError extends Error {
  constructor(message, statusCode) {
    super(); //Calls the Error contructor. Extends the default error class
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
