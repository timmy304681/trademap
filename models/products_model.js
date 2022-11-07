const pool = require('../util/mysql');

const getProducts = async (pageSize, paging = 0) => {
  const [products] = await pool.execute('SELECT * FROM product ORDER by id LIMIT ?,?', [
    (pageSize * paging).toString(),
    pageSize.toString(),
  ]);
  return products;
};

const searchProducts = async (keyword) => {
  try {
    const [products] = await pool.execute('SELECT * FROM product WHERE title like ?', [
      `%${keyword}%`,
    ]);

    return products;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getAutoComplete = async (keyword) => {
  try {
    const [products] = await pool.execute('SELECT * FROM product WHERE title like ? limit 10', [
      `%${keyword}%`,
    ]);

    return products;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const createProduct = async (product, number, images) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const { userId, title, price, description, time, place, address, lat, lng, county, district } =
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

    // create product in product table
    const [createResult] = await conn.execute(productSql, [
      number,
      userId,
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

    // create images info in image table
    images.map(async (x) => {
      await conn.execute('INSERT INTO image (product_id,image) VALUES (?,?)', [
        createResult.insertId,
        x,
      ]);
    });
    // create order info
    await conn.execute('INSERT INTO `order` (user_id, product_id) VALUES (?,?)', [
      userId,
      createResult.insertId,
    ]);

    await conn.query('COMMIT');
    return { id: createResult.insertId, number };
  } catch (error) {
    await conn.query('ROLLBACK');
    console.log(error);
    return false;
  } finally {
    await conn.release();
  }
};

module.exports = { getProducts, searchProducts, createProduct, getAutoComplete };
