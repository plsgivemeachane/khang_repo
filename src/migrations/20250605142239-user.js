'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
      },
      asset: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      avatar: {
        type: Sequelize.STRING,
        defaultValue: "https://cdn-icons-png.flaticon.com/512/5804/5804911.png",
      },
      roleId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // hoặc 'RESTRICT' hoặc 'CASCADE' tùy logic
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      bio: {
        type: Sequelize.STRING,
      },
      SOCAL_MEDIA: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
