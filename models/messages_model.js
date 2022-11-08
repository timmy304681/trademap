const pool = require('../util/mysql');
const mongoCollection = require('../util/mongodb');

const getMessages = async (user1, user2) => {
  const chats = await mongoCollection
    .find({ $or: [{ user: [user1, user2] }, { user: [user2, user1] }] })
    .toArray();
  return chats;
};

const saveMessages = async (user1, user2, sender, message, timeStamp) => {
  mongoCollection.updateOne(
    { user: [user1, user2] },
    { $push: { messages: { sender, message, timeStamp } } },
    { upsert: true }
  );
};

module.exports = { getMessages, saveMessages };
