require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const mongo = require('../util/mongodb');
const http = require('http');

const { Server } = require('socket.io');

const io = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // 監聽 連線狀態
  const db = mongo.db('mongoChat');
  const chat = db.collection('chats');

  io.on('connection', async (socket) => {
    console.log('a user connected');

    //create function to send status
    sendStatus = function (s) {
      socket.emit('status', s);
    };
    // Get chats from mongo collection
    socket.on('chatRoom', async function (data) {
      const { user1, user2 } = data;
      const chats = await chat
        .find({ $or: [{ user: [user1, user2] }, { user: [user2, user1] }] })
        .toArray();
      socket.emit('output', chats);
    });
    //Hand input events
    socket.on('input', function (data) {
      console.log('server recieve ');
      const { user1, user2, sender, message, timeStamp } = data;

      // check for name and message
      if (sender == '' || message == '') {
        //send error status
        sendStatus('Please enter a name and message');
      }

      // Insert message
      chat.updateOne(
        { user: [user1, user2] },
        { $push: { messages: { sender, message, timeStamp } } },
        { upsert: true } //若無資料，可建立
      );
      // chat.insertOne(data);
      io.emit('output', [{ messages: [data] }]);
      // send status object
      sendStatus({ message: 'Message sent', clear: true });
    });
    //Handle clear
    socket.on('clear', function (data) {
      console.log('server recieve clear ');
      //Remove all chats from collection
      chat.deleteMany({});
      //Emit cleared
      socket.emit('cleared');
    });
  });
};

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

module.exports = io;
