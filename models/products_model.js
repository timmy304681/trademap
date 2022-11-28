const pool = require('../util/mysql');

const getProductsByPaging = async (pageSize, paging = 0) => {
  const [products] = await pool.execute('SELECT * FROM product ORDER by id LIMIT ?,?', [
    (pageSize * (paging - 1)).toString(),
    pageSize.toString(),
  ]);
  return products;
};

const getProducts = async () => {
  const [products] = await pool.execute(
    `SELECT  product_id, user_id, title, price, description,lat,lng,image,photo,name
     FROM product  
     JOIN image ON product.id=image.product_id 
     JOIN user ON product.user_id=user.id 
     ORDER by product.id`
  );

  return products;
};

const getProductDetails = async (id) => {
  const [productDetails] = await pool.execute(
    `SELECT product.id AS id, title, number, price, time, description, place, address,lat,lng , user_id, name, email,photo,status, DATE_FORMAT(time,"%Y/%m/%d %H:%i") AS "localTime"
      FROM product JOIN user ON product.user_id=user.id WHERE product.id=?`,
    [id]
  );
  const [images] = await pool.execute('SELECT * FROM image WHERE product_id=?', [id]);
  const imagesArr = images.map((x) => x.image);
  productDetails[0].images = imagesArr;
  return productDetails;
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
    tags.map(async (x) => {
      if (x != '') {
        await conn.execute('INSERT INTO product_tag (product_id,tag) VALUES (?,?)', [
          createResult.insertId,
          x,
        ]);
      }
    });

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

const reviseProduct = async (id, property, value) => {
  try {
    let result;
    if (property !== 'place') {
      const sql = `UPDATE product SET ${property}=? WHERE id=?`;
      [result] = await pool.execute(sql, [value, id]);
    }

    if (property === 'place') {
      const { place, address, lat, lng, county, district } = value;

      [result] = await pool.execute(
        'UPDATE product SET place=?,address=?,lat=?,lng=?,county=?,district=? WHERE id=?',
        [place, address, lat, lng, county, district, id]
      );
    }

    // 只會有一個row被更改
    if (result.affectedRows === 1) {
      const result = { id };
      result[`${property}`] = value;
      return result;
    }
    return { error: 'Revise title failed' };
  } catch (error) {
    console.log(error);
    return { error: 'Revise title failed' };
  }
};

module.exports = {
  getProducts,
  getProductDetails,
  searchProducts,
  createProduct,
  getAutoComplete,
  getProductsByPaging,

  reviseProduct,
};
