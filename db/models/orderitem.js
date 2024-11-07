'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderItem.belongsTo(models.Order, {
        foreignKey:'orderId',
        as:'order'
      });

      OrderItem.belongsTo(models.Product, {
        foreignKey:'productId',
        as:'product'
      })
    }
  }
  OrderItem.init({
    orderId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'orders',
        key:'id'
      }
    },
    productId:{
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'products',
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
    unitPrice: {
      type:DataTypes.DECIMAL(10,2),
      allowNull:false,
      validate:{
        isDecimal:true,
        min:0
      }
    },
    variantAttributes: DataTypes.JSON,
    subtotal: {
      type:DataTypes.DECIMAL(10,2),
      allowNull:false,
      validate:{
        isDecimal:true,
        min:0
      }
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    underscored: true,
  });
  return OrderItem;
};