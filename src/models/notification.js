'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */ static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
     }
  }
  Notification.init(
    {
      userId: DataTypes.INTEGER,
      type: DataTypes.ENUM('message', 'order', 'system', 'custom'),
      title: DataTypes.STRING,
      content: DataTypes.TEXT('medium'),
      data: DataTypes.JSON,
      isRead: DataTypes.BOOLEAN,
    },

    {
      sequelize,
      modelName: 'Notification',
    }
  );
  return Notification;
};
