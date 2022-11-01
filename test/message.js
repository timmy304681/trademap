require('dotenv').config();
const express = require('express');
const app = express();
const { MONGODB_URL, MONGODB_USER, MONGODB_PASSWORD, SERVER_PORT } = process.env;
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

async function main() {
  const client = new MongoClient(
    `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/?retryWrites=true&w=majority`
  );
  await client.connect();
  console.log('Mongo db Connected');
  // 監聽 連線狀態
  const db = client.db('mongoChat');
  const chat = db.collection('chats');

  io.on('connection', async (socket) => {
    console.log('a user connected');

    //create function to send status
    sendStatus = function (s) {
      socket.emit('status', s);
    };
    // Get chats from mongo collection
    const chats = await chat.find().limit(100).sort({ _id: 1 }).toArray();
    socket.emit('output', chats);
    //Hand input events
    socket.on('input', function (data) {
      console.log('server recieve ');
      let name = data.name;
      let message = data.message;

      // check for name and message
      if (name == '' || message == '') {
        //send error status
        sendStatus('Please enter a name and message');
      } else {
        // Insert message
        chat.insertOne(data);
        io.emit('output', [data]);
        // send status object
        sendStatus({ message: 'Message sent', clear: true });
      }
    });
    //Handle  clear
    socket.on('clear', function (data) {
      console.log('server recieve clear ');
      //Remove all chats from collection
      chat.deleteMany({});
      //Emit cleared
      socket.emit('cleared');
    });
  });
}
main();
async function mangooseConn() {
  await mongoose.connect(
    `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/?retryWrites=true&w=majority`
  );

  const messagesSchema = await mongoose.Schema({
    name: String,
    msg: String,
    time: Number,
  });

  const message = mongoose.model('Message', messagesSchema);
  // 將聊天資料轉成資料模型
  const m = new message({ name: 'Timmy', msg: 'Hello', time: 12123, a: 123 });
  // 存至資料庫
  await m.save();
  console.log('finish');
  process.exit();
}

//set port to 3000
server.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
