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
router.get('/message_demo', (req, res) => {
  res.render('message_demo', { title: '聊天室' });
});

router.get('/test', (req, res) => {
  res.render('here', { title: 'Here地圖', HERE_API_KEY: HERE_API_KEY });
});

router.get('/reserve', (req, res) => {
  res.render('reserve', { title: '商品預約系統' });
});

router.get('/profile', (req, res) => {
  res.render('profile', { title: '會員登入系統' });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: '會員註冊' });
});

router.get('/product_details', (req, res) => {
  res.render('product_details', { title: '商品細節頁面' });
});

router.get('/404', (req, res) => {
  res.render('404', { title: 'Page not found' });
});

module.exports = router;
