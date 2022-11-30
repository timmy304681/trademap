const cache = require('../util/redis');
const axios = require('axios');
const jieba = require('nodejieba');
const productModel = require('../models/products_model');
const userModel = require('../models/users_model');
const orderModel = require('../models/orders_model');
const reserveModel = require('../models/reserve_model');
const { getDistance, s3UploadFiles, getImagePath } = require('../util/util');

const pageSize = 6;

require('dotenv').config();
const { REDIS_EXPIRE, IMAGES_URL } = process.env;

const getProducts = async (req, res) => {
  // console.log(req.body);
  // console.log(req.params);
  // console.log(req.query);
  const { category } = req.params;
  const paging = parseInt(req.query.paging, 10) || 1;

  async function findProduct(category) {
    // eslint-disable-next-line default-case
    switch (category) {
      case 'all':
        return productModel.getProductsByPaging(pageSize, paging);
      case 'suggest':
        return productModel.getProducts();
      case 'autoCompleteSearch': {
        const { keyword } = req.query;
        return productModel.getAutoComplete(keyword);
      }
      case 'search': {
        const { keyword } = req.query;
        if (keyword) {
          return productModel.searchProducts(keyword);
        }
        break;
      }
      case 'details': {
        const { id } = req.query;

        if (isNaN(id)) {
          return false;
        }

        let cacheProductDetails;

        if (cache.ready) {
          cacheProductDetails = await cache.get(`product:${id}`);
        }

        if (cacheProductDetails) {
          // Get product details from cache
          return [JSON.parse(cacheProductDetails)];
        }

        // Search product details  from  mysql
        const productDetails = await productModel.getProductDetails(id);
        productDetails[0].photo = getImagePath(productDetails[0].photo);
        productDetails[0].images = productDetails[0].images.map((x) => getImagePath(x));

        if (cache.ready) {
          // Save product details in cache
          await cache.set(`product:${id}`, JSON.stringify(productDetails[0]), { EX: REDIS_EXPIRE });
        }

        return productDetails;
      }
    }
    return Promise.resolve({});
  }

  let productsList;
  productsList = await findProduct(category);

  if (productsList.length === undefined) {
    res.status(400).json({ error: 'Wrong Request' });
    return;
  }

  // if search mode, calculate distance
  if (category === 'search' && req.query.distance) {
    const { distance, lat, lng } = req.query;
    productsList = productsList.filter((x) => {
      const relativeDistance = getDistance(x.lat, x.lng, lat, lng, 'K');
      x.distance = relativeDistance;
      return relativeDistance < distance;
    });
  }

  // if suggest mode, calculate distance and return paging
  if (category === 'suggest') {
    const { lat, lng } = req.query;

    productsList.forEach((x) => {
      const relativeDistance = getDistance(x.lat, x.lng, lat, lng, 'K');
      x.distance = relativeDistance;
    });
    productsList.sort((a, b) => a.distance - b.distance); // sort data by distance
    productsList = productsList.slice(pageSize * (paging - 1), pageSize * (paging - 1) + pageSize);
  }

  if (category === 'suggest' || category === 'suggest') {
    productsList.forEach((x) => {
      x.photo = getImagePath(x.photo);
      x.image = getImagePath(x.image);
    });
  }

  res.status(200).json(productsList);
};

const postProduct = async (req, res) => {
  const userId = req.user.id;
  const { title, price, description, time, tags } = req.body;
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

  if (placeDetail === undefined) {
    return res.status(400).json({ error: '面交地點位置資訊錯誤' });
  }
  placeDetail = JSON.parse(placeDetail);

  //   Set order number by time , total 18 numbers
  const date = new Date();
  const dataValues = [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, '0'),
    date.getDate().toString().padStart(2, '0'),
    date.getHours().toString().padStart(2, '0'),
    date.getMinutes().toString().padStart(2, '0'),
    date.getSeconds().toString().padStart(2, '0'),
    date.getMilliseconds().toString().padStart(4, '0'),
  ];

  const number = dataValues.join('');

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
  const images = s3UploadImgs.map((x) => x.key);

  // create product for sell
  const createResult = await productModel.createProduct(productData, number, images, tags);

  if (createResult.error) {
    return res.status(400).json({ error: createResult.error });
  }

  // 如果當會員已經上傳兩次商品，則讓他成為鑽石會員
  const ordersList = await orderModel.getOrders(userId);
  const forSale = ordersList.filter((x) => x['user_id'] === userId);
  if (forSale.length > 1) {
    const result = await userModel.upgradeMembershipGrade(userId);
  }

  // 利用上傳的tag去搜尋商品預約，然後將搜尋到商品作距離運算
  const userReserves = await reserveModel.searchReserve(tags);
  userReserves.map((x) => {
    const relativeDistance = getDistance(x.lat, x.lng, productData.lat, productData.lng, 'K');
    x.distance = relativeDistance;
  });
  const updateResult = await reserveModel.updateProduct(userReserves, createResult.id);

  // 利用line notify 通知所有符合的user
  if (!userReserves.err) {
    // eslint-disable-next-line no-restricted-syntax
    for (userReserve of userReserves) {
      if (userReserve['line_token'] == null) {
        continue;
      }

      const postData = {
        message: `您預約的商品：${userReserve.tag}已到貨，請登入網頁確認`,
        imageThumbnail: `${IMAGES_URL}/${images[0]}`,
        imageFullsize: `${IMAGES_URL}/${images[0]}`,
      };
      const params = {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userReserve['line_token']}`,
        },
      };

      axios.post('https://notify-api.line.me/api/notify', postData, params);
    }
  }

  res.status(200).json(createResult);
};

const segmentTitles = async (req, res) => {
  const { title } = req.query;
  const segments = jieba.textRankExtract(title, 10);
  const result = segments.map((x) => x.word);

  res.status(200).json(result);
};

const reviseProduct = async (req, res) => {
  // TODO:  這邊要作賣方驗證，確認是他的訂單才可修改
  const { id, title, price, description, time } = req.body;
  let placeDetail = req.body['place-result'];
  let result;
  let isRevise = false;

  if (title !== undefined && title !== '' && title.trim() !== '') {
    result = await productModel.reviseProduct(id, 'title', title);
    isRevise = true;
  }

  if (price !== undefined && price !== '') {
    result = await productModel.reviseProduct(id, 'price', price);
    isRevise = true;
  }

  if (description !== undefined && description !== '' && description.trim() !== '') {
    result = await productModel.reviseProduct(id, 'description', description);
    isRevise = true;
  }

  if (time !== undefined && time !== '') {
    result = await productModel.reviseProduct(id, 'time', time);
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

    result = await productModel.reviseProduct(id, 'place', placeObj);
    isRevise = true;
  }

  if (!isRevise) {
    return res.status(400).json({ error: '輸入錯誤，無任何修改' });
  }
  // result
  if (result.error) {
    return res.status(400).json(result);
  }
  // 因為有修改過商品資訊，要刪掉cache資料
  if (cache.ready) {
    await cache.del(`product:${id}`);
  }
  res.status(200).json(result);
};

module.exports = { getProducts, postProduct, segmentTitles, reviseProduct };
