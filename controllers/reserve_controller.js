const reserveModel = require('../models/reserve_model');

const createReserve = async (req, res) => {
  const userId = req.user.id;
  const { lat, lng, distance, tags } = req.body;
  if (distance > 255) {
    return res.status(400).json({ error: 'distance must be < 255' });
  }

  const result = await reserveModel.createReserve(userId, lat, lng, distance, tags);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.status(200).json(result);
};

module.exports = { createReserve };
