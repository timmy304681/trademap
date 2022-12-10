const pool = require('../util/mysql');
const { SQLError } = require('../util/error_handler');

const getUser = async (userId) => {
  try {
    const [user] = await pool.execute(
      'SELECT id,email,name,photo,role_id FROM `user`  WHERE id=?',
      [userId]
    );
    return user;
  } catch (error) {
    throw new SQLError('get user failed', error);
  }
};

const getEmail = async (email) => {
  try {
    const [userEmailSearch] = await pool.execute('SELECT * FROM `user` WHERE email=?', [email]);
    return userEmailSearch;
  } catch (error) {
    throw new SQLError('get user email failed', error);
  }
};

const checkAccount = async (email, name) => {
  try {
    const [userEmailSearch] = await pool.execute('SELECT * FROM `user` WHERE email=?', [email]);
    const [userNameSearch] = await pool.execute('SELECT * FROM `user` WHERE name=?', [name]);

    if (userEmailSearch.length > 0) {
      return { error: 'Email already exist' };
    }
    if (userNameSearch.length > 0) {
      return { error: 'Name already exist' };
    }
    return { message: 'Email & Name available' };
  } catch (error) {
    throw new SQLError('check account failed', error);
  }
};

const signUp = async (name, email, passwordHash, photo) => {
  try {
    const [user] = await pool.execute(
      'INSERT INTO `user` (name, email, password, photo) VALUE (?,?,?,?)',
      [name, email, passwordHash, photo]
    );
    return { id: user.insertId, name, email };
  } catch (error) {
    throw new SQLError('sign up failed', error);
  }
};

const getRolePermission = async (roleId) => {
  try {
    const [search] = await pool.execute('SELECT * FROM `role-permission` WHERE role_id=?', [
      roleId,
    ]);
    return search;
  } catch (error) {
    throw new SQLError('get role permission failed', error);
  }
};

const upgradeMembershipGrade = async (userId) => {
  try {
    await pool.execute('UPDATE `user` SET role_id=2 WHERE id=?', [userId]);
    return 'upgrade membership grade';
  } catch (error) {
    throw new SQLError('upgrade membership grade failed', error);
  }
};

const saveLineToken = async (userId, lineToken) => {
  try {
    await pool.execute('UPDATE `user` SET `line_token`=? WHERE id=?', [lineToken, userId]);
    return 'add line token';
  } catch (error) {
    throw new SQLError('save line token failed', error);
  }
};

module.exports = {
  getUser,
  getEmail,
  signUp,
  checkAccount,
  getRolePermission,
  upgradeMembershipGrade,
  saveLineToken,
};
