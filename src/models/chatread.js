'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ChatRead = sequelize.define("ChatRead", {
    userId: DataTypes.INTEGER,
    chatId: DataTypes.INTEGER,
    seenAt: DataTypes.DATE,
  });

  ChatRead.associate = function (models) {
    ChatRead.belongsTo(models.Chat, { foreignKey: 'chatId' });
    ChatRead.belongsTo(models.User, { foreignKey: 'userId' }); // default
    ChatRead.belongsTo(models.User, { as: 'user', foreignKey: 'userId' }); // alias for include
  };

  return ChatRead;
};
