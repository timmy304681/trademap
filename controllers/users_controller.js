const userModel = require('../models/user_model');

const getUser = async (req, res) => {
  const { id } = req.query;

  if (id === undefined) {
    return res.status(400).json({ error: 'NO user id ' });
  }
  const user = await userModel.getUser(id);

  res.status(200).json(user);
};

module.exports = { getUser };
