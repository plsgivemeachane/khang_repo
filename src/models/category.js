'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */ static associate(models) {
      // define association here
      Category.hasMany(models.AccGame, {
        foreignKey: 'category_id',
        as: 'accgame',
      }),
        Category.belongsTo(models.Category, {
          foreignKey: 'parent_id',
          as: 'category',
        });
        Category.hasMany(models.Tool, {
          foreignKey: 'category_id',
          as: 'tool',
        })
    }
  }
  Category.init(
    {
      name: DataTypes.STRING,

      slug: DataTypes.STRING,
      parent_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Category',
    }
  );
  return Category;
};
