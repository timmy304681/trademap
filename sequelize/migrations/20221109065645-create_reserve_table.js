'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reserve', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      tag: {
        allowNull: false,
        type: Sequelize.STRING(10),
      },
      lat: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 6),
      },
      lng: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 6),
      },
      distance: {
        allowNull: false,
        type: Sequelize.TINYINT.UNSIGNED,
      },
    });
    await queryInterface.addConstraint('reserve', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'reserver_user_fk',
      onDelete: 'cascade',
      references: { table: 'user', field: 'id' },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('reserve', 'reserver_user_fk');
    await queryInterface.dropTable('reserve');
  },
};
