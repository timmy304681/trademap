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
    if (message.trim() == '') {
      return { error: '內容不可為空白' };
    }
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
      `SELECT chat_room.user_id,chatmate,name AS chatmateName,photo as chatmatePhoto,product_id,title FROM chat_room 
        JOIN user ON chat_room.chatmate=user.id
        JOIN product ON chat_room.product_id=product.id
        WHERE chat_room.user_id=?`,
      [userId]
    );
    return chatrooms;
  } catch (err) {
    console.log(err);
  }
};

const createChatroom = async (userId, chatemateId, productId) => {
  const conn = await pool.getConnection();

  try {
    console.log(userId, chatemateId);
    // check if chatrooms already exist
    const [chatrooms1] = await conn.execute(
      'SELECT * FROM chat_room WHERE user_id=? AND chatmate=?',
      [userId, chatemateId]
    );
    const [chatrooms2] = await conn.execute(
      'SELECT * FROM chat_room WHERE user_id=? AND chatmate=?',
      [chatemateId, userId]
    );

    if (chatrooms1.length != 0 || chatrooms2.length != 0) {
      await conn.execute('UPDATE chat_room SET product_id=? WHERE user_id=? AND chatmate=?', [
        productId,
        userId,
        chatemateId,
      ]);
      await conn.execute('UPDATE chat_room SET product_id=? WHERE user_id=? AND chatmate=?', [
        productId,
        chatemateId,
        userId,
      ]);
      return { message: `chatroom already exist` };
    }

    // insert
    await conn.query('START TRANSACTION');

    await conn.execute(`INSERT INTO chat_room (user_id, chatmate,product_id) VALUES (?,?,?)`, [
      userId,
      chatemateId,
      productId,
    ]);
    await conn.execute(`INSERT INTO chat_room (user_id, chatmate,product_id) VALUES (?,?,?)`, [
      chatemateId,
      userId,
      productId,
    ]);
    await conn.query('COMMIT');
    return { message: `chatroom of user ${userId} & ${chatemateId} create succssefuly` };
  } catch (err) {
    console.log('here err');
    console.log(err);
    await conn.query('ROLLBACK');

    return false;
  } finally {
    await conn.release();
  }
};

module.exports = { getMessages, saveMessages, getChatrooms, createChatroom };
