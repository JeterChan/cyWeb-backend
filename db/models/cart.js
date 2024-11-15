'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cart.belongsTo(models.User,
        {
          foreignKey:'userId',
          as:'user'
        });
      Cart.hasMany(models.Cartitem, {
        foreignKey:'cartId',
        as:'cartItems'
      })
    }
  }
  Cart.init({
    userId: { 
      type:DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      allowNull:true,
      unique:true,
      references: {
        model:'users',
        key:'id'
      }
    },
    sessionId:{
      type:DataTypes.STRING,
      allowNull:true
    },
    status: {
      type:DataTypes.ENUM('guest','user'), // 訪客, 用戶
      defaultValue:'guest'
    }
  }, {
    sequelize,
    modelName: 'Cart',
    underscored: true,
  });
  return Cart;
};