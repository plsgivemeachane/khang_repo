'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */ static associate(models) {
      // 👇 Một Order có nhiều User
      Order.belongsTo(models.Tool, {
        foreignKey: 'id',
        as: 'tools',
      });
      
    }
  }
  Order.init(
    {
      userOrder:DataTypes.INTEGER,
      orderId:DataTypes.INTEGER,
      quantity:DataTypes.INTEGER,
      payment:DataTypes.BOOLEAN

    },
    {
      sequelize,
      modelName: 'Order',
    }
  );
  return Order;
};
