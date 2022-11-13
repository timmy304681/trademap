const orderModel = require('../models/orders_model');
const userModel = require('../models/users_model');

const getOrders = async (req, res) => {
  const userId = req.user.id;

  const ordersList = await orderModel.getOrders(userId);

  res.status(200).json(ordersList);
};

module.exports = { getOrders };
