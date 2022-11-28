const orderModel = require('../models/orders_model');
const userModel = require('../models/users_model');
const cache = require('../util/redis');

const getOrders = async (req, res) => {
  const userId = req.user.id;

  const ordersList = await orderModel.getOrders(userId);

  res.status(200).json(ordersList);
};

const changeOrderStatus = async (req, res) => {
  // TODO:  這邊要作賣方驗證，確認是他的訂單才可修改
  const { productId, status } = req.body;
  const result = await orderModel.changeOrderStatus(productId, status);
  if (result.error) {
    return res.status(400).json(result);
  }

  if (cache.ready) {
    await cache.del(`product:${productId}`);
    // console.log(`change order status, delete product:${productId} from cache`);
  }
  res.status(200).json(result);
};

module.exports = { getOrders, changeOrderStatus };
