const pool = require('../util/mysql');

const getOrders = async (userId) => {
  const [orders] = await pool.execute(
    'SELECT * FROM `order` JOIN product ON `order`.product_id=product.id WHERE `order`.user_id=?',
    [userId]
  );
  return orders;
};

module.exports = { getOrders };
