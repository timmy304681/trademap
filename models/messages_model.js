const pool = require('../util/mysql');
const mongoCollection = require('../util/mongodb');

const getMessages = async (user1, user2) => {
  try {
    const chats = await mongoCollection
      .find({ $or: [{ user: [user1, user2] }, { user: [user2, user1] }] })
      .toArray();
    return chats;
  } catch (err) {
    console.log(err);
  }
};

const saveMessages = async (user1, user2, sender, message, timeStamp) => {
  try {
    mongoCollection.updateOne(
      { user: [user1, user2] },
      { $push: { messages: { sender, message, timeStamp } } },
      { upsert: true }
    );
  } catch (err) {
    console.log(err);
  }
};

const getChatrooms = async (userId) => {
  try {
    const [chatrooms] = await pool.execute(
      'SELECT user_id,chatmate,name AS chatmateName,photo as chatematePhoto FROM chat_room JOIN user ON chat_room.chatmate=user.id WHERE chat_room.user_id=?',
      [userId]
    );
    return chatrooms;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getMessages, saveMessages, getChatrooms };
