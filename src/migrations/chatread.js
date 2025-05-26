'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChatReads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // 👈 bảng Users
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      chatId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chats', // 👈 bảng Chats
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      seenAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Unique constraint để 1 user không đọc cùng 1 chat nhiều lần
    await queryInterface.addConstraint('ChatReads', {
      fields: ['userId', 'chatId'],
      type: 'unique',
      name: 'unique_user_chat_read'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChatReads');
  }
};
