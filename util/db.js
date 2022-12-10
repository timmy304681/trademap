const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

require('dotenv').config();
const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MONGODB_URL,
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_DATABASE,
  MONGODB_COLLECTION,
} = process.env;

// mongo database
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

const mongodbCollection = mongo.db(MONGODB_DATABASE).collection(MONGODB_COLLECTION);

// mysql database

const pool = mysql.createPool({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 10,
  multipleStatements: true,
});

module.exports = { mongodbCollection, pool };
