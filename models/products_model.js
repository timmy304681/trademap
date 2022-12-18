const { pool } = require('../util/db');
const { SQLError, RedisError } = require('../util/error_handler');
const cache = require('../util/cache');

require('dotenv').config();
const { REDIS_EXPIRE } = process.env;

const getProductsByPaging = async (pageSize, paging = 0) => {
  try {
    const [products] = await pool.execute('SELECT * FROM product ORDER by id LIMIT ?,?', [
      (pageSize * (paging - 1)).toString(),
      pageSize.toString(),
    ]);
    return products;
  } catch (error) {
    throw new SQLError('get products by page failed', error);
  }
};

const getProducts = async () => {
  try {
    const [products] = await pool.execute(
      `SELECT  product_id, user_id, title, price, description,lat,lng,image,photo,name
     FROM product  
     JOIN image ON product.id=image.product_id 
     AND image.image = (
      SELECT image
      FROM image
      WHERE image.product_id=product.id
      LIMIT 1
      )
     JOIN user ON product.user_id=user.id 
     ORDER by product.id`
    );

    return products;
  } catch (error) {
    throw new SQLError('get products failed', error);
  }
};

const getProductDetails = async (id) => {
  try {
    const [productDetails] = await pool.execute(
      `SELECT product.id AS id, title, number, price, time, description, place, address,lat,lng , user_id, name, email,photo,status, DATE_FORMAT(time,"%Y/%m/%d %H:%i") AS "localTime"
      FROM product JOIN user ON product.user_id=user.id WHERE product.id=?`,
      [id]
    );
    const [images] = await pool.execute('SELECT * FROM image WHERE product_id=?', [id]);
    const imagesArr = images.map((x) => x.image);
    productDetails[0].images = imagesArr;
    return productDetails;
  } catch (error) {
    throw new SQLError('get product details failed', error);
  }
};

const searchProducts = async (keyword) => {
  try {
    const [products] = await pool.execute(
      `
    SELECT id,title,lat,lng 
    FROM product 
    WHERE MATCH (title) AGAINST (?)`,
      [keyword]
    );

    return products;
  } catch (error) {
    throw new SQLError('search products failed', error);
  }
};

const getAutoComplete = async (keyword) => {
  try {
    const [products] = await pool.execute('SELECT * FROM product WHERE title like ? limit 10', [
      `%${keyword}%`,
    ]);

    return products;
  } catch (error) {
    throw new SQLError('get auto complete failed', error);
  }
};

const createProduct = async (product, number, images, tags) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    const { userId, title, price, description, time, place, address, lat, lng, county } = product;
    const district = product.district === undefined ? null : product.district;
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
    // create tags info in product_tag table
    tags.map(async (tag) => {
      if (tag != '') {
        await conn.execute('INSERT INTO product_tag (product_id,tag) VALUES (?,?)', [
          createResult.insertId,
          tag,
        ]);
      }
    });

    // create images info in image table
    images.map(async (image) => {
      await conn.execute('INSERT INTO image (product_id,image) VALUES (?,?)', [
        createResult.insertId,
        image,
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
    throw new SQLError('create product failed', error);
  } finally {
    await conn.release();
  }
};

const revisePropertyOfProduct = async (userId, id, property, value) => {
  try {
    const sql = `UPDATE product SET ${property}=? WHERE id=? AND user_id=?`;
    const [reviseResult] = await pool.execute(sql, [value, id, userId]);
    if (reviseResult.affectedRows === 1) {
      const result = { id };
      result[`${property}`] = value;
      return result;
    }
    return { error: `修改${property}失敗` };
  } catch (error) {
    throw new SQLError('revise property of a product failed', error);
  }
};

const revisePlaceOfProduct = async (userId, id, value) => {
  try {
    const { place, address, lat, lng, county, district } = value;
    const [reviseResult] = await pool.execute(
      'UPDATE product SET place=?,address=?,lat=?,lng=?,county=?,district=? WHERE id=? AND user_id=?',
      [place, address, lat, lng, county, district, id, userId]
    );

    if (reviseResult.affectedRows === 1) {
      const result = { id };
      result.place = value;
      return result;
    }
    return { error: '修改place失敗' };
  } catch (error) {
    throw new SQLError('revise place info of a product failed', error);
  }
};

const getProductCache = async (id) => {
  try {
    return await cache.get(`product:${id}`);
  } catch (error) {
    throw new RedisError('get product cache from redis failed', error);
  }
};
const createProductCache = async (id, productDetail) => {
  try {
    await cache.set(`product:${id}`, JSON.stringify(productDetail), { EX: REDIS_EXPIRE });
  } catch (error) {
    throw new RedisError('create product cache to redis failed', error);
  }
};

const deleteProductCache = async (id) => {
  try {
    await cache.del(`product:${id}`);
  } catch (error) {
    throw new RedisError('delete product cache from redis failed', error);
  }
};

module.exports = {
  getProducts,
  getProductDetails,
  searchProducts,
  createProduct,
  getAutoComplete,
  getProductsByPaging,
  revisePropertyOfProduct,
  revisePlaceOfProduct,
  getProductCache,
  createProductCache,
  deleteProductCache,
};
