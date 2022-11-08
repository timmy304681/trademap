require('dotenv').config();
const { MONGODB_URL, MONGODB_USER, MONGODB_PASSWORD, MONGODB_DATABASE, MONGODB_COLLECTION } =
  process.env;
const { MongoClient } = require('mongodb');

const mongo = new MongoClient(
  `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/?retryWrites=true&w=majority`
);

try {
  mongo.connect();
  console.log('Mongo db Connected');
} catch (err) {
  console.log('Mongodb connected failed!!');
  console.log(err);
}

const db = mongo.db(MONGODB_DATABASE);
const mongoCollection = db.collection(MONGODB_COLLECTION);
module.exports = mongoCollection;
