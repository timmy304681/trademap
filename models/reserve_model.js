const pool = require('../util/mysql');
const { getDistance } = require('../util/util');

const createReserve = async (userId, lat, lng, place, tags) => {
  try {
    tags.map(async (x) => {
      if (x != '') {
        await pool.execute(
          'INSERT INTO reserve (user_id, lat, lng, place,tag) VALUES (?,?,?,?,?)',
          [userId, lat, lng, place, x]
        );
      }
    });

    return { message: 'create reserve successfully' };
  } catch (err) {
    console.log(err);

    return { error: 'create reserve failed' };
  }
};

const getReserve = async (userId) => {
  try {
    const [reserves] = await pool.execute('SELECT * FROM reserve WHERE user_id =?', [userId]);
    return reserves;
  } catch (err) {
    console.log(err);
    return { error: 'get reserve failed' };
  }
};

const searchReserve = async (tags) => {
  try {
    const [users] = await pool.query(
      'SELECT reserve.id as reserve_id, lat, lng, place,user_id,tag,name,line_token FROM reserve JOIN user ON reserve.user_id=user.id WHERE tag IN (?)',
      [tags]
    );

    return users;
  } catch (err) {
    console.log(err);
    return { error: 'get reserve tags failed' };
  }
};

const deleteReserve = async (tagId) => {
  try {
    const [users] = await pool.query('DELETE FROM reserve WHERE id=?;', [tagId]);
  } catch (err) {
    console.log(err);
    return { error: 'delete reserve tags failed' };
  }
};

const updateProduct = async (userReserves, productId) => {
  try {
    for (let i = 0; i < userReserves.length; i++) {
      const { distance } = userReserves[i];
      const reserveId = userReserves[i].reserve_id;

      await pool.query('UPDATE reserve SET product_id=?, distance=? WHERE id=?', [
        productId,
        distance,
        reserveId,
      ]);
    }
    return { message: 'update success' };
  } catch (error) {
    return { error: 'update product_id failed' };
  }
};

module.exports = { createReserve, getReserve, searchReserve, deleteReserve, updateProduct };
