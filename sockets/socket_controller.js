const validator = require('validator');
const messagesModel = require('../models/messages_model');

async function getChatrooms(data, socket, io) {
  const { user1, user2, userId1, userId2 } = data;
  // 先排序，確保兩個使用者的對話都存在同一個collection
  const userList = [user1, user2].sort();
  console.log(userList);
  socket.join(`${userList[0]}_${userList[1]}`);
  const chats = await messagesModel.getMessages(userList[0], userList[1]);
  socket.emit('output', chats);
}

async function saveMessages(data, socket, io) {
  console.log('server recieve ');

  // sanitizers 處理惡意輸入
  data.message = validator.escape(data.message);

  const { user1, user2, sender, message, timeStamp } = data;

  // 先排序，確保兩個使用者的對話都存在同一個collection
  const userList = [user1, user2].sort();

  // Insert message
  await messagesMoodel.saveMessages(userList[0], userList[1], sender, message, timeStamp);
  // socket.emit('output', [{ messages: [data] }]);

  io.to(`${userList[0]}_${userList[1]}`).emit('output', [{ messages: [data] }]);
}

module.exports = { getChatrooms, saveMessages };
