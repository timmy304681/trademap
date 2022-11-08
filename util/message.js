require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const messagesMoodel = require('../models/messages_model');

const { Server } = require('socket.io');
const { AlexaForBusiness } = require('aws-sdk');

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
      socket.join(`${userId1}_${userId2}`);
      const chats = await messagesMoodel.getMessages(user1, user2);
      socket.emit('output', chats);
    });
    // Hand input events
    socket.on('input', async (data) => {
      console.log('server recieve ');
      const { user1, user2, sender, message, timeStamp } = data;

      // check for name and message
      if (sender === '' || message === '') {
        // send error status
        sendStatus('Please enter a name and message');
      }

      // Insert message
      await messagesMoodel.saveMessages(user1, user2, sender, message, timeStamp);
      // chat.updateOne(
      //   { user: [user1, user2] },
      //   { $push: { messages: { sender, message, timeStamp } } },
      //   { upsert: true } // 若無資料，可建立
      // );
      // chat.insertOne(data);
      io.emit('output', [{ messages: [data] }]);
      // send status object
      sendStatus({ message: 'Message sent', clear: true });
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
