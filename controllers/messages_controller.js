const messagesModel = require('../models/messages_model');

const getMessages = async (req, res) => {
  const { user1, user2 } = req.query;

  const chats = await messagesModel.getMessages(user1, user2);

  res.status(200).json(chats);
};

const getChatrooms = async (req, res) => {
  const { userId } = req.query;

  const chatrooms = await messagesModel.getChatrooms(userId);

  res.status(200).json(chatrooms);
};

module.exports = { getMessages, getChatrooms };
