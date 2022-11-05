const router = require('express').Router();
require('dotenv').config();
const { HERE_API_KEY } = process.env;

router.get('/', (req, res) => {
  res.render('index', { title: '首頁' });
});

router.get('/here', (req, res) => {
  res.render('here.ejs', {
    HERE_API_KEY: HERE_API_KEY,
    title: 'Here地圖',
  });
});

router.get('/product', (req, res) => {
  res.render('product', { HERE_API_KEY: HERE_API_KEY, title: '商品上傳頁面' });
});

module.exports = router;
