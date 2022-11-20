const orderModel = require('../models/orders_model');
const userModel = require('../models/users_model');

const getOrders = async (req, res) => {
  const userId = req.user.id;

  const ordersList = await orderModel.getOrders(userId);

  res.status(200).json(ordersList);
};

const changeOrderStatus = async (req, res) => {
  const { productId, status } = req.body;
  const result = await orderModel.changeOrderStatus(productId, status);
  if (result.error) {
    return res.status(400).json(result);
  }

  res.status(200).json(result);
};

module.exports = { getOrders, changeOrderStatus };
