const messagesModel = require('../models/messages_model');
const orderModel = require('../models/orders_model');
const cache = require('../util/redis');

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

const createChatroom = async (req, res) => {
  const userId = Number(req.user.id);
  console.log(req.body);
  const { sellerId, productId } = req.body;

  if (userId == sellerId) {
    return res.status(400).json({ error: 'This product is yours, no need to contact to seller' });
  }

  // create chatroom
  const chatrooms = await messagesModel.createChatroom(userId, sellerId, productId);
  // 因為買方聯繫了，所以商品狀態要改成洽談中
  await orderModel.changeStatusToContact(userId, productId);
  if (cache.ready) {
    await cache.del(`product:${productId}`);
    // console.log(`change order status, delete product:${productId} from cache`);
  }

  res.status(200).json(chatrooms);
};

module.exports = { getMessages, getChatrooms, createChatroom };
