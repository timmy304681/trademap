const express = require('express');
const app = express();
const { wrapAsync } = require('./util/util');
// env
require('dotenv').config();
const { GOOGLE_API_KEY, SERVER_PORT, HERE_API_KEY, API_VERSION } = process.env;
app.use('/public', express.static(__dirname + '/public'));
app.use('/images', express.static(__dirname + '/images'));
// view
app.set('view engine', 'ejs');

app.get('/here', (req, res) => {
  res.render('./here.ejs', {
    HERE_API_KEY: HERE_API_KEY,
  });
});

// mock datat
const data = [
  {
    title: '台北車站',
    address: {
      label: '台灣100台北市中正區Beiping West Road台北車站',
      city: '台北市',
      district: '中正區',
    },
    position: { lat: 25.04745, lng: 121.51613 },
    item: '全新Macbook，女用',
    image: './images/bear.png',
  },
  {
    title: '台北車站',
    address: {
      label: '台灣106台北市大安區忠孝東路四段205巷7弄7號大心新泰式麵食',
      city: '台北市',
      district: '大安區',
    },
    position: { lat: 25.04217, lng: 121.55232 },
    item: 'Samsung S7，超棒棒棒棒！！！！！！！！！',
    image: './images/cat.png',
  },
  {
    title: '善導寺捷運站',
    address: {
      label: '台灣100台北市中正區忠孝東路一段善導寺捷運站',
      city: '台北市',
      district: '中正區',
    },
    position: { lat: 25.0449, lng: 121.52323 },
    item: 'DELL螢幕',
    image: './images/fox.png',
  },
];

app.get(
  '/data',
  wrapAsync(async (req, res) => {
    res.status(200).json(data);
  })
);

app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send('Internal Server Error');
});

app.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
