'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccGame extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */ static associate(models) {
      AccGame.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'user',
      }),
        AccGame.belongsTo(models.Category, {
          foreignKey: 'category_id',
          as: 'category',
        });
    }
  }
  AccGame.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT('long'),
      slug: DataTypes.STRING,
      image: DataTypes.STRING,
      list_image: DataTypes.JSON,
      price: DataTypes.INTEGER,
      status_acc: DataTypes.BOOLEAN,
      status: DataTypes.STRING,
      created_by: DataTypes.INTEGER,
      method_login: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
      contact: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'AccGame',
    }
  );
  return AccGame;
};
