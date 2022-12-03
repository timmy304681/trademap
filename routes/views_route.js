const router = require('express').Router();
require('dotenv').config();
const { HERE_API_KEY, MAPTILER_API_KEY, STATIC_FILES_URL } = process.env;

router.get('/', (req, res) => {
  res.render('index', { title: '首頁', HERE_API_KEY, MAPTILER_API_KEY, STATIC_FILES_URL });
});

router.get('/order', (req, res) => {
  res.render('order', { title: '訂單頁面', HERE_API_KEY, MAPTILER_API_KEY, STATIC_FILES_URL });
});

router.get('/product', (req, res) => {
  res.render('product', {
    title: '商品上傳頁面',
    HERE_API_KEY,
    MAPTILER_API_KEY,
    STATIC_FILES_URL,
  });
});

router.get('/message', (req, res) => {
  res.render('message', { title: '聊天室', STATIC_FILES_URL });
});
router.get('/message_demo', (req, res) => {
  res.render('message_demo', { title: '聊天室', STATIC_FILES_URL });
});

router.get('/test', (req, res) => {
  res.render('here', { title: 'Here地圖', HERE_API_KEY, MAPTILER_API_KEY, STATIC_FILES_URL });
});

router.get('/reserve', (req, res) => {
  res.render('reserve', {
    title: '商品預約系統',
    HERE_API_KEY,
    MAPTILER_API_KEY,
    STATIC_FILES_URL,
  });
});

router.get('/suggest', (req, res) => {
  res.render('suggest', { title: '商品推薦', STATIC_FILES_URL });
});

router.get('/profile', (req, res) => {
  res.render('profile', { title: '會員登入系統', STATIC_FILES_URL });
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: '會員註冊', STATIC_FILES_URL });
});

router.get('/product_details', (req, res) => {
  const id = req.query.id != undefined ? req.query.id : 1;
  res.render('product_details', { title: '商品細節頁面', id, STATIC_FILES_URL });
});

router.get('/membership', (req, res) => {
  res.render('membership', { title: '會員分級規則', STATIC_FILES_URL });
});

router.get('/404', (req, res) => {
  res.render('404', { title: 'Page not found', STATIC_FILES_URL });
});

module.exports = router;
