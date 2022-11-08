const router = require('express').Router();
require('dotenv').config();
const { HERE_API_KEY } = process.env;

router.get('/', (req, res) => {
  res.render('index', { title: '首頁', HERE_API_KEY: HERE_API_KEY });
});

router.get('/order', (req, res) => {
  res.render('order', { title: '訂單頁面', HERE_API_KEY: HERE_API_KEY });
});

router.get('/product', (req, res) => {
  res.render('product', { title: '商品上傳頁面', HERE_API_KEY: HERE_API_KEY });
});

router.get('/message', (req, res) => {
  res.render('message', { title: '聊天室' });
});
router.get('/message2', (req, res) => {
  res.render('message2', { title: '聊天室' });
});

router.get('/test', (req, res) => {
  res.render('here', { title: 'Here地圖', HERE_API_KEY: HERE_API_KEY });
});

module.exports = router;
