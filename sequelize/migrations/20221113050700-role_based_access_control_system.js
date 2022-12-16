'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      role: {
        allowNull: false,
        type: Sequelize.STRING(10),
      },
    });
    await queryInterface.createTable('permission', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      permission: {
        allowNull: false,
        type: Sequelize.STRING(30),
      },
    });
    await queryInterface.createTable('role-permission', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      role_id: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      permission_id: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
      },
    });
    await queryInterface.addColumn('user', 'role_id', {
      allowNull: false,
      type: Sequelize.INTEGER.UNSIGNED,
      defaultValue: 1,
    });
    await queryInterface.addConstraint('role-permission', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'role-pemission_role-id_fk',
      onDelete: 'cascade',
      references: { table: 'role', field: 'id' },
    });
    await queryInterface.addConstraint('role-permission', {
      fields: ['permission_id'],
      type: 'foreign key',
      name: 'role-pemission_permission-id_fk',
      references: { table: 'permission', field: 'id' },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('role-permission', 'role-pemission_role-id_fk');
    await queryInterface.removeConstraint('role-permission', 'role-pemission_permission-id_fk');
    await queryInterface.removeColumn('user', 'role_id');
    await queryInterface.dropTable('role-permission');
    await queryInterface.dropTable('permission');
    await queryInterface.dropTable('role');
  },
};
