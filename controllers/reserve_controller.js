const reserveModel = require('../models/reserve_model');
const userModel = require('../models/users_model');
const axios = require('axios');

require('dotenv').config();
const { LINE_NOTIFY_CLIENT_ID, LINE_NOTIFY_CALLBACK_URL, LINE_NOTIFY_CLIENT_SECRET } = process.env;

const createReserve = async (req, res) => {
  const userId = req.user.id;
  const { lat, lng, place, tags } = req.body;
  console.log('lat, lng, place, tags: ', lat, lng, place, tags);

  const result = await reserveModel.createReserve(userId, lat, lng, place, tags);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.status(200).json(result);
};

const getReserve = async (req, res) => {
  const userId = req.user.id;

  const result = await reserveModel.getReserve(userId);
  res.status(200).json(result);
};

const deleteReserve = async (req, res) => {
  const tagId = req.query.id;

  const result = await reserveModel.deleteReserve(tagId);
  res.status(200).json(result);
};

const getLineCode = async (req, res) => {
  const state = 'state';
  res.redirect(
    `https://notify-bot.line.me/oauth/authorize?response_type=code&client_id=${LINE_NOTIFY_CLIENT_ID}&redirect_uri=${LINE_NOTIFY_CALLBACK_URL}&scope=notify&state=${state}`
  );
};

const getLineToken = async (req, res) => {
  const { code } = req.query;
  const oauthToken = await axios.post(
    `https://notify-bot.line.me/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${LINE_NOTIFY_CALLBACK_URL}&client_id=${LINE_NOTIFY_CLIENT_ID}&client_secret=${LINE_NOTIFY_CLIENT_SECRET}`
  );

  const lineToken = oauthToken.data['access_token'];

  res.redirect(`/reserve?lineToken=${lineToken}`);
};

module.exports = { createReserve, getReserve, getLineCode, getLineToken, deleteReserve };
