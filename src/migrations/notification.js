'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        // Loại thông báo
        type: Sequelize.ENUM('message', 'order', 'system', 'custom'),
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING,
      }, // Tiêu đề (nếu cần)

      content: {
        type: Sequelize.TEXT,
      }, // Nội dung hiển thị

      data: {
        type: Sequelize.JSON,
      }, // Dữ liệu kèm theo (chatId, orderId, roomId, v.v.)

      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('Notifications');
  },
};
