
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role',
      });
      User.hasMany(models.Payment, {
        foreignKey: 'userId',
        as: 'payments',
      })
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    asset: DataTypes.INTEGER,
    avatar: DataTypes.STRING,
    roleId: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
    bio: DataTypes.STRING,
    SOCAL_MEDIA:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
