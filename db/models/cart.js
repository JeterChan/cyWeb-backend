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
      Cart.hasMany(models.CartItem, {
        foreignKey:'cartId',
        as:'cartItems'
      })
    }
  }
  Cart.init({
    userId: { 
      type:DataTypes.INTEGER,
      allowNull:false,
      unique:true,
      references: {
        model:'users',
        key:'id'
      }
    },
    status: {
      type:DataTypes.ENUM('active','checkout','completed') ,// 活躍, 結帳中, 已完成
      defaultValue:'active'
    }
  }, {
    sequelize,
    modelName: 'Cart',
    underscored: true,
  });
  return Cart;
};