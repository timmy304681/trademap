const pool = require('../util/mysql');

const getUser = async (userId) => {
  const [user] = await pool.execute('SELECT id,email,name,photo FROM `user`  WHERE id=?', [userId]);
  return user;
};

const getEmail = async (email) => {
  const [user] = await pool.execute('SELECT * FROM `user` WHERE email=?', [email]);
  return user;
};

const signUp = async (name, email, passwordHash, photo) => {
  try {
    const [user] = await pool.execute(
      'INSERT INTO `user` (name, email, password, photo) VALUE (?,?,?,?)',
      [name, email, passwordHash, photo]
    );
    return { id: user.insertId, name, email };
  } catch (err) {
    console.log(err);
    return { err: 'Database Query Error' };
  }
};

module.exports = { getUser, getEmail, signUp };
