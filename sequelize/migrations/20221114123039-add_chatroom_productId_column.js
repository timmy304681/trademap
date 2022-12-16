'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('chat_room', 'product_id', {
      type: Sequelize.INTEGER.UNSIGNED,
    });
    await queryInterface.addConstraint('chat_room', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'chatroom_productId_fk',
      references: { table: 'product', field: 'id' },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('chat_room', 'chatroom_productId_fk');
    await queryInterface.removeColumn('chat_room', 'product_id');
  },
};
