'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsTo(models.User, {
        foreignKey: 'userSenderId',
        as: 'users',
      });

      // Liên kết groupId → Room.id
      Chat.belongsTo(models.Room, {
        foreignKey: 'groupId',
        as: 'rooms',
      });
      Chat.belongsTo(models.Chat, {
        foreignKey: 'replyId',
        as: 'replyMessage',
      });
      
    }
  }

  Chat.init(
    {
      groupId: {
        type: DataTypes.INTEGER, // foreign key tới Room.id
        allowNull: false,
      },
      userSenderId: DataTypes.INTEGER,
      content: DataTypes.TEXT("medium"),
      replyId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Chat',
    }
  );

  return Chat;
};
