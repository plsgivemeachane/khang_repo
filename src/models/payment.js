'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  Payment.init(
    {
      userId: DataTypes.INTEGER,
      payment_content: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      payment_value: DataTypes.INTEGER,
      paymentId: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Payment',
    }
  );
  return Payment;
};
