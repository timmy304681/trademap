'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('product', ['title'], {
      type: 'FULLTEXT',
    });
    await queryInterface.addIndex('reserve', ['tag']);
    await queryInterface.addIndex('user', ['email']);
    await queryInterface.addIndex('user', ['name']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('product', 'product_title');
    await queryInterface.removeIndex('reserve', 'reserve_tag');
    await queryInterface.removeIndex('user', 'user_email');
    await queryInterface.removeIndex('user', 'user_name');
  },
};
