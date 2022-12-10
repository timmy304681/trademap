const orderModel = require('../models/orders_model');
const cache = require('../util/redis');

const getOrders = async (req, res) => {
  const userId = req.user.id;

  const ordersList = await orderModel.getOrders(userId);

  res.status(200).json(ordersList);
};

const changeOrderStatus = async (req, res) => {
  const userId = req.user.id;
  const { productId, status } = req.body;
  const result = await orderModel.changeOrderStatus(userId, productId, status);

  // change order status, delete product:${productId} from cache
  if (cache.ready) {
    await cache.del(`product:${productId}`);
  }
  res.status(200).json(result);
};

module.exports = { getOrders, changeOrderStatus };
