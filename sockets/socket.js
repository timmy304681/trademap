require('dotenv').config();
const { Server } = require('socket.io');
const { MongoDBError } = require('../util/error_handler');
const { getChatrooms, saveMessages } = require('./socket_controller');
const { SERVER_URL } = process.env;

const webSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: SERVER_URL,
    },
  });

  // 監聽 連線狀態
  io.on('connection', async (socket) => {
    console.log('a user connected');

    // Get chats from mongo collection
    socket.on('chatRoom', wrapSocketAsync(getChatrooms, socket, io));

    // Hand input events
    socket.on('input', wrapSocketAsync(saveMessages, socket, io));
  });
};

function wrapSocketAsync(cb, socket, io) {
  return async function (emitObject) {
    try {
      await cb(emitObject, socket, io);
    } catch (error) {
      if (error instanceof MongoDBError) {
        console.error(error.errorLog);
        return socket.emit('Internal server error');
      }
      console.error(error);
      return socket.emit('Internal server error');
    }
  };
}

module.exports = webSocket;
