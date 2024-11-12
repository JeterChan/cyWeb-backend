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
      User.hasMany(models.Order, {
        foreignKey:'userId',
        as:'orders'
      })
    }
  }
  User.init({
    name: { 
      type:DataTypes.STRING,
    },
    email: { 
      type:DataTypes.STRING,
      allowNull:false
    },
    password: {
      type:DataTypes.STRING,
      allowNull:false
    },
    role: { 
      type:DataTypes.ENUM('vistor','user','admin'),
      defaultValue:'vistor'
    },
    phone: { 
      type:DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'User',
    underscored: true,
  });
  return User;
};