require('dotenv').config();
const { MONGODB_URL, MONGODB_USER, MONGODB_PASSWORD } = process.env;
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

const mongo = new MongoClient(
  `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/?retryWrites=true&w=majority`
);

mongo.connect();
console.log('Mongo db Connected');

module.exports = mongo;
