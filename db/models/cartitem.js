'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cartitem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Cartitem.belongsTo(models.Cart,{
          foreignKey:'cartId',
          as:'cart'
      });
      
      Cartitem.belongsTo(models.Product, {
        foreignKey:'productId',
        as:'product'
      })
    }
  }
  Cartitem.init({
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
    modelName: 'Cartitem',
    underscored: true,
  });
  return Cartitem;
};