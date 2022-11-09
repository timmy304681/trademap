require('dotenv').config();
const messagesMoodel = require('../models/messages_model');
const { Server } = require('socket.io');

const io = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // 監聽 連線狀態
  io.on('connection', async (socket) => {
    console.log('a user connected');

    // create function to send status
    const sendStatus = function (s) {
      socket.emit('status', s);
    };

    // Get chats from mongo collection
    socket.on('chatRoom', async (data) => {
      console.log(data);
      const { user1, user2, userId1, userId2 } = data;
      // 先排序，確保兩個使用者的對話都存在同一個collection
      const userList = [user1, user2].sort();
      console.log(userList);
      socket.join(`${userList[0]}_${userList[1]}`);
      const chats = await messagesMoodel.getMessages(userList[0], userList[1]);
      socket.emit('output', chats);
    });

    // Hand input events
    socket.on('input', async (data) => {
      console.log('server recieve ');
      const { user1, user2, sender, message, timeStamp } = data;

      // 先排序，確保兩個使用者的對話都存在同一個collection
      const userList = [user1, user2].sort();

      // Insert message
      await messagesMoodel.saveMessages(userList[0], userList[1], sender, message, timeStamp);

      io.to(`${userList[0]}_${userList[1]}`).emit('output', [{ messages: [data] }]);
    });

    // Handle clear
    socket.on('clear', (data) => {
      console.log('server recieve clear ');
      // Remove all chats from collection
      chat.deleteMany({});
      // Emit cleared
      socket.emit('cleared');
    });
  });
};

module.exports = io;
