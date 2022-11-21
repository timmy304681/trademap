'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('reserve', 'distance', {
      allowNull: true,
      type: Sequelize.TINYINT.UNSIGNED,
    });
    await queryInterface.addColumn('reserve', 'place', {
      allowNull: false,
      type: Sequelize.STRING(100),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('reserve', 'distance', {
      allowNull: false,
      type: Sequelize.TINYINT.UNSIGNED,
    });
    await queryInterface.removeColumn('reserve', 'place');
  },
};
