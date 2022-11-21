'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('reserve', 'product_id', {
      allowNull: true,
      type: Sequelize.INTEGER.UNSIGNED,
    });
    await queryInterface.addConstraint('reserve', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'reserve_product_fk',
      references: { table: 'product', field: 'id' },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('reserve', 'reserve_product_fk');
    await queryInterface.removeColumn('reserve', 'product_id');
  },
};
