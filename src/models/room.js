'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Room.belongsTo(models.User, {
        foreignKey: 'createdBy',
        as: 'users',
      });
    }
  }
  Room.init(
    {
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: DataTypes.STRING,
      isGroup: DataTypes.BOOLEAN,
      createdBy: DataTypes.INTEGER,
      password: DataTypes.STRING,
      member: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: 'Room',
    }
  );

  return Room;
};
