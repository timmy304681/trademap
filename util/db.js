const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

require('dotenv').config();
const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_DATABASE_TEST,
  MONGODB_URL,
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_DATABASE,
  MONGODB_DATABASE_TEST,
  MONGODB_COLLECTION,
  NODE_ENV,
} = process.env;

// mongo database
const mongoConfig = {
  production: {
    // for production
    db: MONGODB_DATABASE,
  },
  development: {
    // for  development
    db: MONGODB_DATABASE,
  },
  test: {
    // for automation testing (command: npm run test)
    db: MONGODB_DATABASE_TEST,
  },
};

const mongo = new MongoClient(
  `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/?retryWrites=true&w=majority`
);

try {
  mongo.connect();
  console.log('Mongo db Connected');
} catch (err) {
  console.error('Mongodb connected failed!!');
  console.error(err);
}

const mongodbCollection = mongo.db(mongoConfig[NODE_ENV].db).collection(MONGODB_COLLECTION);

// mysql database

const mysqlConfig = {
  production: {
    // for production
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  },
  development: {
    // for  development
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
  },
  test: {
    // for automation testing (command: npm run test)
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE_TEST,
  },
};

const mysqlEnv = mysqlConfig[NODE_ENV];
mysqlEnv.waitForConnections = true;
mysqlEnv.connectionLimit = 20;
mysqlEnv.queueLimit = 20;
mysqlEnv.multipleStatements = true;

const pool = mysql.createPool(mysqlEnv);

module.exports = { mongodbCollection, pool };
