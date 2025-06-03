'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CartItem.belongsTo(models.Cart,{
          foreignKey:'cartId',
          as:'cart'
      });
      
      CartItem.belongsTo(models.Product, {
        foreignKey:'productId',
        as:'product'
      })
    }
  }
  CartItem.init({
    cartId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'Carts',
        key:'id'
      }
    },
    productId: { 
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'Products', 
        key:'id'
      }
    },
    quantity: {
      type:DataTypes.INTEGER,
      allowNull:false,
      validate:{
        isInt:true,
        min:0
      }
    },
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName:'cart_items',
    underscored: true,
  });
  return CartItem;
};