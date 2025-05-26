'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ImageToChat extends Model {
    static associate(models) {
      // 👉 Một hình ảnh thuộc về 1 Chat
      ImageToChat.belongsTo(models.Chat, {
        foreignKey: 'chatId',
        as: 'chat',
        onDelete: 'CASCADE',
      });
    }
  }

  ImageToChat.init(
    {
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ImageToChat',
    }
  );

  return ImageToChat;
};
