'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('reserve', 'distance', {
      allowNull: true,
      type: Sequelize.DECIMAL(5, 1),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('reserve', 'distance', {
      allowNull: true,
      type: Sequelize.TINYINT.UNSIGNED,
    });
  },
};
