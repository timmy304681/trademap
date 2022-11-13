const pool = require('../util/mysql');

const roles = [['黃金會員'], ['鑽石會員']];
const permissions = [['product contact'], ['order'], ['message'], ['reserve']];
const rolePermisson = [
  [1, 1],
  [1, 2],
  [1, 3],
  [2, 1],
  [2, 2],
  [2, 3],
  [2, 4],
];

(async () => {
  // truncate all table
  await pool.query(`
  SET FOREIGN_KEY_CHECKS = 0; 
  TRUNCATE table role;
  TRUNCATE table permission;
  TRUNCATE table  \`role-permission\`;
  SET FOREIGN_KEY_CHECKS = 1;
  `);
  await pool.query('INSERT INTO role (role) VALUES ?', [roles]);
  await pool.query('INSERT INTO permission (permission) VALUES ?', [permissions]);
  await pool.query('INSERT INTO `role-permission` (role_id,permission_id) VALUES ?', [
    rolePermisson,
  ]);

  //
  console.log('create RBAC succesfully');
  //
  process.exit();
})();
