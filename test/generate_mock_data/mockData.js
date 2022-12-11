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

const product = [
  {
    title: '9成新Macbook',
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
    image: [
      'images/apple_macbook_air_m1_1668103589_45d6eaa3_progressive.jpg',
      'images/apple_macbook_air_m1_1668103589_62fece01_progressive.jpg',
      'images/apple_macbook_air_m1_1668103589_501f84a4_progressive.jpg',
    ],
  },
  {
    title: 'iPhone12 Pro 128G 電池88',
    description: `全配 外觀漂亮`,
    image: ['iphone12_pro_128g_88_1668153963_bbef88da_progressive.jpg'],
  },
  {
    title: 'SAMSUNG三星 32型 C32F391FWE VA曲面零閃屏低藍光液晶螢幕',
    description: `VA面板
    最佳曲率 1800R
    178度 超廣視角 寬廣不失真
    1920x1080 FHD高解析
    對比度3000:1
    亮度：250cd/m2、反應時間4ms
    支援HDMI/DP輸入介面
    低藍光、零閃屏技術的貼心保護
    Game Mode電競模式
    環保節能科技 輕鬆省下 50% 耗電
    面板不漏光 暗部表現更具層次
    
    輕微使用痕跡已過保 可議價 有實體店面可看機 `,
    image: [
      'samsung_32_c32f391fwe_va_1668341560_5ec50fe2_progressive.jpg',
      `samsung_32_c32f391fwe_va_1668341560_de1ea2c1_progressive.jpg`,
    ],
  },
];
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
