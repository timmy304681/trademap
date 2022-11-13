const pool = require('../util/mysql');

const getUser = async (userId) => {
  const [user] = await pool.execute('SELECT id,email,name,photo,role_id FROM `user`  WHERE id=?', [
    userId,
  ]);
  return user;
};

const getEmail = async (email) => {
  const [userEmailSearch] = await pool.execute('SELECT * FROM `user` WHERE email=?', [email]);

  return userEmailSearch;
};

const checkAcount = async (email, name) => {
  const [userEmailSearch] = await pool.execute('SELECT * FROM `user` WHERE email=?', [email]);
  const [userNameSearch] = await pool.execute('SELECT * FROM `user` WHERE name=?', [name]);

  if (userEmailSearch.length > 0) {
    return { error: 'Email already exist' };
  }
  if (userNameSearch.length > 0) {
    return { error: 'Name already exist' };
  }
  return { message: 'Email & Name available' };
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

const getRolePermission = async (roleId) => {
  const [search] = await pool.execute('SELECT * FROM `role-permission` WHERE role_id=?', [roleId]);
  return search;
};

module.exports = { getUser, getEmail, signUp, checkAcount, getRolePermission };
