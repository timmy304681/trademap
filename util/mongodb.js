require('dotenv').config();
const { MONGODB_URL, MONGODB_USER, MONGODB_PASSWORD, MONGODB_DATABASE, MONGODB_COLLECTION } =
  process.env;
const { MongoClient } = require('mongodb');

const mongo = new MongoClient(
  `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/?retryWrites=true&w=majority`
);
(async () => {
  try {
    await mongo.connect();
    console.log('Mongo db Connected');
  } catch (err) {
    console.error('Mongodb connected failed!!');
    console.error(err);
  }
})();
const mongodbCollection = mongo.db(MONGODB_DATABASE).collection(MONGODB_COLLECTION);
module.exports = mongodbCollection;
