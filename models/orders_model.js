const pool = require('../util/mysql');
const { SQLError } = require('../util/error_handler');

const getOrders = async (userId) => {
  try {
    const [orders] = await pool.execute(
      `SELECT * , DATE_FORMAT(time,"%Y/%m/%d %H:%i") AS \`localTime\` FROM \`order\` 
      JOIN product ON \`order\`.product_id=product.id 
      WHERE \`order\`.user_id=?
      ORDER BY product.id DESC`,
      [userId]
    );

    return orders;
  } catch (error) {
    throw new SQLError('get orders failed', error);
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
    throw new SQLError('change status to contact', error);
  } finally {
    await conn.release();
  }
};

const changeOrderStatus = async (userId, productId, status) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');

    await conn.execute('UPDATE `order` SET status=? WHERE product_id=? AND user_id=?', [
      status,
      productId,
      userId,
    ]);
    await conn.execute('UPDATE `product` SET status=? WHERE id=? AND user_id=?', [
      status,
      productId,
      userId,
    ]);

    await conn.query('COMMIT');
    return { message: 'change order status successfully' };
  } catch (error) {
    await conn.query('ROLLBACK');

    throw new SQLError('change order status', error);
  } finally {
    await conn.release();
  }
};

module.exports = { getOrders, changeStatusToContact, changeOrderStatus };
