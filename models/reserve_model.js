const pool = require('../util/mysql');

const createReserve = async (userId, lat, lng, distance, tags) => {
  try {
    tags.map(async (x) => {
      if (x != '') {
        await pool.execute(
          'INSERT INTO reserve (user_id, lat, lng, distance, tag) VALUES (?,?,?,?,?)',
          [userId, lat, lng, distance, x]
        );
      }
    });

    return { message: 'create reserve successfully' };
  } catch (err) {
    console.log(err);
    return { error: 'create reserve failed' };
  }
};

module.exports = { createReserve };
