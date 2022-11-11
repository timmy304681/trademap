const pool = require('../util/mysql');

const getOrders = async (userId) => {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM `order` JOIN product ON `order`.product_id=product.id WHERE `order`.user_id=?',
      [userId]
    );
    return orders;
  } catch (err) {
    console.log(err);
    return { err: 'Database Query Error' };
  }
};

const changeStatusToContact = async (userId, productId) => {
  const conn = await pool.getConnection();
  try {
    const [order] = await conn.execute('SELECT * FROM `order` WHERE user_id=? AND product_id=?', [
      userId,
      productId,
    ]);

    if (order.length != 0) {
      return { message: 'order already create' };
    }

    await conn.query('START TRANSACTION');

    await conn.execute('INSERT INTO `order` (user_id, product_id) VALUES (?,?)', [
      userId,
      productId,
    ]);

    await conn.execute('UPDATE `order` SET status=1 WHERE product_id=?', [productId]);
    await conn.execute('UPDATE `product` SET status=1 WHERE id=?', [productId]);

    await conn.query('COMMIT');
    return { message: ' create order and change order status successfully' };
  } catch (error) {
    await conn.query('ROLLBACK');
    console.log(error);
    return false;
  } finally {
    await conn.release();
  }
};

module.exports = { getOrders, changeStatusToContact };
