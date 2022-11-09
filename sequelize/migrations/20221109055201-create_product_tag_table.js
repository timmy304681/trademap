'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_tag', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      tag: {
        allowNull: false,
        type: Sequelize.STRING(10),
      },
    });
    await queryInterface.addConstraint('product_tag', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'tag_product_fk',
      onDelete: 'cascade',
      references: { table: 'product', field: 'id' },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('product_tag', 'tag_product_fk');
    await queryInterface.dropTable('product_tag');
  },
};
