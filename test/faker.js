const pool = require('../util/mysql');
const { faker } = require('@faker-js/faker');
const fs = require('fs');
const fsPromises = fs.promises;
const { parse } = require('csv-parse');
const path = require('path');
const { createClient } = require('pexels');
const axios = require('axios');

require('dotenv').config();
const { PEXELS_API_KEY } = process.env;

async function main() {
  // insert user
  // await insertUsers(10);

  // insert product (540 places)
  await insertProducts(540, 26);

  console.log('finish!!');
  process.exit();
}

main();

// functions
async function insertProducts(num, userNum) {
  const inputFilePath = __dirname + '/MRT_bike_position.csv';
  const inputFile = await fsPromises.readFile(inputFilePath);
  const parsedResult = await parseCSV(inputFile);

  // get product and  image from pexels
  // const productArr = await createProductsArr(num, 'electronics');
  // get product and image from
  const response = await axios.get('https://fakestoreapi.com/products');
  const productArr = response.data;
  console.log('productArr: ', productArr.length);

  const conn = await pool.getConnection();

  for (let i = 0; i < num; i++) {
    await conn.query('START TRANSACTION');

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

    // const product = {
    //   number,
    //   user_id: Math.floor(Math.random() * userNum) + 1,
    //   title: productArr[i].alt.substr(0, 100),
    //   price: Math.floor(Math.random() * 10000) + 1000,
    //   description: productArr[i].alt,
    //   time: new Date(),
    //   place: parsedResult[i].place,
    //   address: parsedResult[i].place,
    //   lat: parsedResult[i].lat,
    //   lng: parsedResult[i].lng,
    //   county: '台北市',
    //   district: '運輸',
    // };
    // const images = productArr[i].src.medium;

    const product = {
      number,
      user_id: Math.floor(Math.random() * userNum) + 1,
      title: productArr[i].title.substr(0, 100),
      price: Math.floor(Math.random() * 10000) + 1000,
      description: productArr[i].description,
      time: new Date(),
      place: parsedResult[i].place,
      address: parsedResult[i].place,
      lat: parsedResult[i].lat,
      lng: parsedResult[i].lng,
      county: '台北市',
      district: '運輸',
    };
    const images = productArr[i].image;

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

    const [result] = await conn.query(productSql, [[Object.values(product)]]);

    await conn.execute('INSERT INTO image (product_id,image) VALUES (?,?)', [
      result.insertId,
      images,
    ]);

    await conn.execute('INSERT INTO `order` (user_id, product_id) VALUES (?,?)', [
      product.user_id,
      result.insertId,
    ]);

    await conn.query('COMMIT');
  }
  await conn.release();
}

async function createProductsArr(num, keyword) {
  const page = Math.floor(num / 80) + 1;
  let productArr = [];
  for (let i = 1; i < page + 1; i++) {
    const imagesObj = await createProducts(keyword, page);
    productArr = productArr.concat(imagesObj.photos);
  }
  return productArr;
}

function createProducts(keyword, page) {
  return new Promise((resolve, reject) => {
    const client = createClient(PEXELS_API_KEY);
    // 80 is max per-page
    client.photos.search({ query: keyword, page: page, per_page: 80 }).then((photos) => {
      resolve(photos);
    });
  });
}

async function insertUsers(num) {
  // insert user
  const users = [];
  for (let i = 0; i < num; i++) {
    users.push(createRandomUser());
  }
  const userSql = `INSERT INTO user (email,name, password,photo) VALUES ?`;
  await pool.query(userSql, [users.map((x) => Object.values(x))]);
}

function createRandomUser() {
  return {
    // userId: faker.datatype.uuid(),
    email: faker.internet.email(),
    name: faker.internet.userName(),
    password: faker.internet.password(),
    photo: faker.image.avatar(),
  };
}

function parseCSV(input) {
  return new Promise((resolve, reject) => {
    parse(
      input,
      {
        delimiter: ',',
        columns: true,
      },
      (error, output) => {
        if (error) {
          console.error('[ERROR] parseCSV: ', error.message);
          reject('[ERROR] parseCSV: ', error.message);
        }

        resolve(output);
      }
    );
  });
}
