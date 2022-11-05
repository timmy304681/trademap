'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      number: {
        allowNull: false,
        type: Sequelize.STRING(18),
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      price: {
        allowNull: false,
        type: Sequelize.MEDIUMINT.UNSIGNED,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      time: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      status: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.TINYINT.UNSIGNED,
      },
      place: {
        allowNull: false,
        type: Sequelize.STRING(30),
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      lat: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 6),
      },
      lng: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 6),
      },
      county: {
        allowNull: false,
        type: Sequelize.STRING(10),
      },
      district: {
        allowNull: false,
        type: Sequelize.STRING(10),
      },
      create_time: {
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
        type: Sequelize.DATE(3),
      },
    });
    await queryInterface.createTable('image', {
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
      image: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
    });
    await queryInterface.createTable('user', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(60),
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      photo: {
        allowNull: false,
        type: Sequelize.STRING(60),
      },
    });

    await queryInterface.createTable('order', {
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
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      status: {
        allowNull: false,
        type: Sequelize.TINYINT.UNSIGNED,
      },
    });
    await queryInterface.createTable('chat_room', {
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
      chatmate: {
        allowNull: false,
        type: Sequelize.INTEGER.UNSIGNED,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product');
    await queryInterface.dropTable('image');
    await queryInterface.dropTable('user');
    await queryInterface.dropTable('order');
    await queryInterface.dropTable('chat_room');
  },
};
