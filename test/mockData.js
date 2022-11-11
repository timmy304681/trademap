const data = [
  {
    title: '台北車站',
    address: {
      label: '台灣100台北市中正區Beiping West Road台北車站',
      city: '台北市',
      district: '中正區',
    },
    position: { lat: 25.04745, lng: 121.51613 },
    item: '全新Macbook，女用九成新',
    image: '/images/bear.png',
  },
  {
    title: '台北車站',
    address: {
      label: '台灣106台北市大安區忠孝東路四段205巷7弄7號大心新泰式麵食',
      city: '台北市',
      district: '大安區',
    },
    position: { lat: 25.04217, lng: 121.55232 },
    item: 'iphone 14 pro，超新',
    image: '/images/cat.png',
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
    image: '/images/fox.png',
  },
];

const product = {
  number: '202211031111111111',
  user_id: '1',
  title: '9成新Macbook',
  price: '25500',
  description: `2018出廠購買2017款式 MacBook Pro retina 13 no Touch Bar
  2017 MacBook Pro retina 13 no touch bar 
  銀 MacBook Pro (13-inch, 2017, Two Thunderbolt 3 ports)
  處理器2.3 GHz Intel Core i5
  記憶體8GB 2133 MHz LPDDR3
  顯示卡Intel Iris Plus Graphics 640 1536 MB
  容量256G ssd
  保固到：過保固
  配件：充電器
  螢幕下方會有一些黑色斜線不影響整體使用`,
  time: '2022-11-03 13:00:00',
  place: '忠孝新生',
  address: '106台北市大安區新生南路一段67號10652',
  lat: 25.04251,
  lng: 121.53286,
  county: '台北市',
  district: '大安區',
};
const users = [
  {
    email: 'timmy@test.com',
    name: 'Timmy',
    password: 'abc123',
    photo: '/images/1b5d8a86-d4a2-4710-b01c-120a82fcdcc1.png',
  },
  {
    email: 'leo@test.com',
    name: 'Leo',
    password: 'abc123',
    photo: '/images/fc1e2f25-4848-4c9b-b4de-5123aadab24e.png',
  },
  {
    email: 'adam@test.com',
    name: 'Adam',
    password: 'abc123',
    photo: '/images/a5a22e6d-e936-46e7-af6d-3ca4dd4237dc.png',
  },
  {
    email: 'david@test.com',
    name: 'David',
    password: 'abc123',
    photo: '/images/d2bc95b3-4002-4dfe-a330-3d75305a9264.png',
  },
];

const chatrooms = [
  { user_id: 1, chatmate: 2 },
  { user_id: 1, chatmate: 3 },
  { user_id: 1, chatmate: 4 },
  { user_id: 2, chatmate: 1 },
  { user_id: 3, chatmate: 1 },
  { user_id: 4, chatmate: 1 },
];

module.exports = { product, users, chatrooms };
