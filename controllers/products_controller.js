const axios = require('axios');
const jieba = require('nodejieba');
const moment = require('moment');
const cache = require('../util/cache');
const productModel = require('../models/products_model');
const userModel = require('../models/users_model');
const orderModel = require('../models/orders_model');
const reserveModel = require('../models/reserve_model');
const productService = require('../services/product_service');
const { getDistance, s3UploadFiles } = require('../util/util');

require('dotenv').config();

const { IMAGES_URL } = process.env;

const getProducts = async (req, res) => {
  const { category } = req.params;
  const paging = parseInt(req.query.paging, 10) || 1;

  const productsList = await productService.findProducts(category, req.query, paging);

  if (!productsList) {
    return res.status(400).json({ error: 'Wrong Request' });
  }

  return res.status(200).json(productsList);
};

const postProduct = async (req, res) => {
  const userId = req.user.id;
  const { title, price, description, time } = req.body;
  let { tags } = req.body;
  let placeDetail = req.body['place-result'];

  // check if exist
  if (title === undefined || title.trim() === '') {
    return res.status(400).json({ error: '商品名稱不能留空' });
  }

  if (price === undefined || price === '' || price < 0 || isNaN(price)) {
    return res.status(400).json({ error: '價錢請輸入大於0數字' });
  }

  if (description === undefined || title.trim() === '') {
    return res.status(400).json({ error: '商品描述不能留空' });
  }

  if (time === undefined || time === '') {
    return res.status(400).json({ error: '面交時間不能留空' });
  }

  for (const tag of tags) {
    if (tag.length > 10) {
      return res.status(400).json({ error: 'tag字數僅允許10以下' });
    }
  }

  if (placeDetail === undefined) {
    return res.status(400).json({ error: '面交地點位置資訊錯誤' });
  }
  placeDetail = JSON.parse(placeDetail);

  //   Set order number by time , total 18 numbers
  const number = moment().format('YYYYMMDDHHmmssSSSS');

  const productData = {
    number,
    userId,
    title,
    price,
    description,
    time,
    place: placeDetail.title,
    address: placeDetail.address.label,
    lat: placeDetail.position.lat,
    lng: placeDetail.position.lng,
    county: placeDetail.address.county,
    district: placeDetail.address.district,
  };

  // images 存入s3
  const s3UploadImgs = await s3UploadFiles(req.files);
  const images = s3UploadImgs.map((image) => image.key);

  // create product for sell
  const createResult = await productModel.createProduct(productData, number, images, tags);

  if (createResult.error) {
    return res.status(400).json({ error: createResult.error });
  }

  // 如果當會員已經上傳兩次商品，則讓他成為黃金級會員
  const ordersList = await orderModel.getOrders(userId);
  const forSale = ordersList.filter((order) => order.user_id === userId);
  if (forSale.length > 1) {
    await userModel.upgradeMembershipGrade(userId);
  }

  // 利用上傳的tag去搜尋商品預約，然後將搜尋到商品作距離運算
  const userReserves = await reserveModel.searchReserve(tags);
  userReserves.forEach((product) => {
    const relativeDistance = getDistance(
      product.lat,
      product.lng,
      productData.lat,
      productData.lng,
      'K'
    );
    product.distance = relativeDistance;
  });
  // 寫入計算過的商品資訊
  await reserveModel.updateProduct(userReserves, createResult.id);

  // 利用line notify 通知所有符合的user
  try {
    for (const userReserve of userReserves) {
      // 若該預約當初沒有建立line token就跳過該次iterate
      if (userReserve.line_token == null) continue;

      const postData = {
        message: `預約商品到貨通知，您預約的商品：${userReserve.tag}已到貨，請登入網頁確認`,
        imageThumbnail: `${IMAGES_URL}/${images[0]}`,
        imageFullsize: `${IMAGES_URL}/${images[0]}`,
      };
      const params = {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userReserve.line_token}`,
        },
      };

      axios.post('https://notify-api.line.me/api/notify', postData, params);
    }
  } catch (error) {
    console.log('line notify發送訊息有錯誤');
  }

  return res.status(200).json(createResult);
};

const segmentTitles = async (req, res) => {
  const { title } = req.query;
  const segments = jieba.textRankExtract(title, 10);
  const result = segments.map((wordExtract) => wordExtract.word);

  res.status(200).json(result);
};

const reviseProduct = async (req, res) => {
  const userId = req.user.id;
  const { id, title, price, description, time } = req.body;

  let placeDetail = req.body['place-result'];
  let result;
  let isRevise = false;

  if (title !== undefined && title !== '' && title.trim() !== '') {
    result = await productModel.reviseProduct(userId, id, 'title', title);
    isRevise = true;
  }

  if (price !== undefined && price !== '') {
    result = await productModel.revisePropertyOfProduct(userId, id, 'price', price);
    isRevise = true;
  }

  if (description !== undefined && description !== '' && description.trim() !== '') {
    result = await productModel.revisePropertyOfProduct(userId, id, 'description', description);
    isRevise = true;
  }

  if (time !== undefined && time !== '') {
    result = await productModel.revisePropertyOfProduct(userId, id, 'time', time);
    isRevise = true;
  }

  if (placeDetail !== undefined) {
    placeDetail = JSON.parse(placeDetail);
    const placeObj = {
      place: placeDetail.title,
      address: placeDetail.address.label,
      lat: placeDetail.position.lat,
      lng: placeDetail.position.lng,
      county: placeDetail.address.county,
      district: placeDetail.address.district,
    };

    result = await productModel.revisePlaceOfProduct(userId, id, placeObj);
    isRevise = true;
  }

  if (!isRevise) {
    return res.status(400).json({ error: '輸入錯誤，無任何修改' });
  }

  // 因為有修改過商品資訊，要刪掉cache資料
  if (cache.ready) {
    await cache.del(`product:${id}`);
  }
  res.status(200).json(result);
};

module.exports = {
  getProducts,
  postProduct,
  segmentTitles,
  reviseProduct,
};
