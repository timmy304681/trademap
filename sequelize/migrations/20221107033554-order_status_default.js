'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('order', 'status', {
      allowNull: false,
      type: Sequelize.TINYINT.UNSIGNED,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('order', 'status', {
      allowNull: false,
      type: Sequelize.TINYINT.UNSIGNED,
    });
  },
};
