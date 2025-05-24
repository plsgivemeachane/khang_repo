'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tool extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */ static associate(models) {
        Tool.belongsTo(models.Category, { foreignKey: 'category_id' });
        Tool.hasMany(models.Order, { foreignKey: 'orderId' });
     }
  }
  Tool.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT('long'),
      image: DataTypes.STRING,
      list_image:DataTypes.JSON,
      price: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
      category_id: DataTypes.INTEGER,
      slug: DataTypes.STRING,
      key_value:DataTypes.TEXT("medium"),

    },
    {
      sequelize,
      modelName: 'Tool',
    }
  );
  return Tool;
};
