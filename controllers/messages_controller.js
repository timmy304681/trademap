const messagesModel = require('../models/messages_model');

const getMessages = async (req, res) => {
  const { user1, user2 } = req.query;

  const chats = await messagesModel.getMessages(user1, user2);

  res.status(200).json(chats);
};

const getChatrooms = async (req, res) => {
  const userId = req.user.id;

  const chatrooms = await messagesModel.getChatrooms(userId);

  const response = {
    user: req.user,
    chatrooms,
  };
  res.status(200).json(response);
};

module.exports = { getMessages, getChatrooms };
