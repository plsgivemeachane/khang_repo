'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tool extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */ static associate(models) {
        Tool.belongsTo(models.Category, { foreignKey: 'categoryId' });
     }
  }
  Tool.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      image: DataTypes.STRING,
      list_image:DataTypes.JSON,
      price: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
      categoryId: DataTypes.INTEGER,
      key_value:DataTypes.STRING,

    },
    {
      sequelize,
      modelName: 'Tool',
    }
  );
  return Tool;
};
