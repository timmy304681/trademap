const orderModel = require('../models/orders_model');

const getOrders = async (req, res) => {
  const { userId } = req.query;

  const ordersList = await orderModel.getOrders(userId);

  res.status(200).json(ordersList);
};

module.exports = { getOrders };
