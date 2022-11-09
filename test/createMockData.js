const pool = require('../util/mysql');
const yargs = require('yargs');
// eslint-disable-next-line prefer-destructuring
const argv = yargs
  .option('number', {
    alias: 'n',
    description: 'number of mock data',
    type: 'number',
    default: 100,
  })
  .help()
  .alias('help', 'h').argv;

const mockDataNumber = argv.number;

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

const {
  number,
  user_id,
  title,
  price,
  description,
  time,
  place,
  address,
  lat,
  lng,
  county,
  district,
} = product;
const mockProductsList = [];

// create a mock products list
for (let i = 1; i <= mockDataNumber; i++) {
  (product.lat = lat + (Math.random() - 0.5) * 0.1),
    (product.lng = lng + (Math.random() - 0.5) * 0.1),
    (product.title = `
    ${Math.floor(Math.random() * 10)}成新${
      ['Macbook', 'iphone', 'ipad'][Math.floor(Math.random() * 2)]
    }`);
  mockProductsList.push({ ...product });
}

const user = [
  {
    email: 'admin_1@test.com',
    name: 'admin_1',
    password: 'password',
    photo: '/images/3b36e86f-f2ea-48e3-a0c0-c9d48e5f091d.png',
  },
  {
    email: 'admin_2@test.com',
    name: 'admin_2',
    password: 'password',
    photo: '/images/e2575c9d-4edf-48c3-8785-dad6f5908109.png',
  },
  {
    email: 'admin_3@test.com',
    name: 'admin_3',
    password: 'password',
    photo: '/images/4088fd41-75c6-46b1-a47b-b199eefbe7b0.png',
  },
  {
    email: 'admin_4@test.com',
    name: 'admin_4',
    password: 'password',
    photo: '/images/080b85ba-8407-429c-99ec-5116a2685704.png',
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

async function main() {
  // truncate all table
  await pool.query(`
  SET FOREIGN_KEY_CHECKS = 0; 
  TRUNCATE table product;
  TRUNCATE table user;
  TRUNCATE table image;
  SET FOREIGN_KEY_CHECKS = 1;
  `);
  // insert new data
  const userSql = `INSERT INTO user (email,name, password,photo) VALUES ?`;
  await pool.query(userSql, [user.map((x) => Object.values(x))]);

  const productSql = `INSERT INTO product ( number,
    user_id,
    title,
    price,
    description,
    time,
    place,
    address,
    lat,
    lng,
    county,
    district) VALUES ?`;
  await pool.query(productSql, [mockProductsList.map((x) => Object.values(x))]);

  // chatrooms
  await pool.query(`INSERT INTO chat_room (user_id,chatmate) VALUES ?`, [
    chatrooms.map((x) => Object.values(x)),
  ]);

  //
  console.log(`Create mock data successfully!! Create ${mockDataNumber} records `);
  // leave process
  process.exit();
}

main();
