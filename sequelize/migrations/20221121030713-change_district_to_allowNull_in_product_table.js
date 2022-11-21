'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('product', 'district', {
      allowNull: true,
      type: Sequelize.STRING(10),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('product', 'district', {
      allowNull: false,
      type: Sequelize.STRING(10),
    });
  },
};
