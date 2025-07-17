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
    id: {
      type: DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true
    },
    name: { 
      type:DataTypes.STRING,
      allowNull:true
    },
    googleId:{
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    email: { 
      type:DataTypes.STRING,
      allowNull:false
    },
    password: {
      type:DataTypes.STRING,
      allowNull:true
    },
    role: { 
      type:DataTypes.ENUM('user','admin'),
      defaultValue:'user'
    },
    phone: { 
      type:DataTypes.STRING,
      allowNull:true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verification_token: {
      type: DataTypes.STRING
    },
    token_expires_at: {
      type:DataTypes.DATE(),
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'User',
    underscored: true,
  });
  return User;
};