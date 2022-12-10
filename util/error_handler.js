const moment = require('moment');

class CustomError extends Error {
  constructor(msg, log) {
    super(msg);
    this.msg = msg;
    this.log = log;
  }

  get errorLog() {
    return {
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      msg: this.msg,
      log: this.log,
    };
  }
}

class SQLError extends CustomError {
  constructor(msg, log) {
    super(msg, log);
    this.type = 'SQL error';
  }

  get errorLog() {
    return {
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      msg: this.msg,
      log: this.log,
      type: this.type,
    };
  }
}

class MongoDBError extends CustomError {
  constructor(msg, log) {
    super(msg, log);
    this.type = 'MongoDb error';
  }

  get errorLog() {
    return {
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      msg: this.msg,
      log: this.log,
      type: this.type,
    };
  }
}

module.exports = {
  CustomError,
  SQLError,
  MongoDBError,
};
