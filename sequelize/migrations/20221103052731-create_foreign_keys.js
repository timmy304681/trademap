'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('product', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'product_user_fk',
      references: { table: 'user', field: 'id' },
    });
    await queryInterface.addConstraint('image', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'image_product_fk',
      onDelete: 'cascade',
      references: { table: 'product', field: 'id' },
    });
    await queryInterface.addConstraint('order', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'order_product_fk',
      onDelete: 'cascade',
      references: { table: 'product', field: 'id' },
    });
    await queryInterface.addConstraint('order', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'order_user_fk',
      onDelete: 'cascade',
      references: { table: 'user', field: 'id' },
    });
    await queryInterface.addConstraint('chat_room', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'chatroom_user_fk',
      onDelete: 'cascade',
      references: { table: 'user', field: 'id' },
    });
    await queryInterface.addConstraint('chat_room', {
      fields: ['chatmate'],
      type: 'foreign key',
      name: 'chatmate_user_fk',
      onDelete: 'cascade',
      references: { table: 'user', field: 'id' },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('product', 'product_user_fk');
    await queryInterface.removeConstraint('image', 'image_product_fk');
    await queryInterface.removeConstraint('order', 'order_product_fk');
    await queryInterface.removeConstraint('order', 'order_user_fk');
    await queryInterface.removeConstraint('chat_room', 'chatroom_user_fk');
    await queryInterface.removeConstraint('chat_room', 'chatmate_user_fk');
  },
};
