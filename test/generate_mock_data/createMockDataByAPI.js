const pool = require('../util/mysql');
const { product, users, chatrooms } = require('./mockData');
const userId = [1, 2, 3, 4];

(async () => {
  // truncate all table
  await pool.query(`
 SET FOREIGN_KEY_CHECKS = 0; 
 TRUNCATE table product;
 TRUNCATE table image;
 TRUNCATE table \`order\`;
 TRUNCATE table product_tag;
 TRUNCATE table reserve;
 TRUNCATE table chat_room;
 SET FOREIGN_KEY_CHECKS = 1;
 `);
  // TODO:

  // exit
  process.exit();
})();
