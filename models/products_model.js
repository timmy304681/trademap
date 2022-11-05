const pool = require('../util/mysql');

const getProducts = async () => {
  const [products] = await pool.execute('SELECT * FROM product');
  return products;
};

const searchProducts = async (keyword) => {
  const [products] = await pool.execute('SELECT * FROM product WHERE title like ?', [
    `%${keyword}%`,
  ]);
  return products;
};

const createProduct = async (product, number) => {
  const { user_id, title, price, description, time, place, address, lat, lng, county, district } =
    product;
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
        district) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;

  const [createResult] = await pool.execute(productSql, [
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
  ]);

  return { id: createResult.insertId, number };
};

module.exports = { getProducts, searchProducts, createProduct };
