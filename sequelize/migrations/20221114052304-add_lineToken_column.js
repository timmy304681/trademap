'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'line_token', {
      allowNull: true,
      type: Sequelize.STRING(50),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'line_token');
  },
};
