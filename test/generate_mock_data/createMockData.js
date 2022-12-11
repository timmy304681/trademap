const pool = require('../util/mysql');
const yargs = require('yargs');

const { product, users, chatrooms } = require('./mockData');
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
  await pool.query(userSql, [users.map((x) => Object.values(x))]);

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
