const pool = require('../util/mysql');

const getUser = async (userId) => {
  const [user] = await pool.execute('SELECT * FROM `user`  WHERE id=?', [userId]);
  return user;
};

module.exports = { getUser };
