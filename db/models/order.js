'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User ,{
        foreignKey:'userId',
        as:'user'
      });

      Order.hasOne(models.Payment, {
        foreignKey:'orderId',
        as:'payment'
      });

      Order.hasMany(models.OrderItem, {
        foreignKey:'orderId',
        as:'orderItems'
      })
    }
  }
  Order.init({
    userId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'users',
        key:'id'
      }
    },
    status: {
      type:DataTypes.ENUM('pending', 'paid', 'processing', 'completed'),
      defaultValue:'pending',
      allowNull:false
    },
    orderNumber: {
      type:DataTypes.STRING,
      allowNull:false
    },
    subtotal: {
      type:DataTypes.DECIMAL(10,2),
      allowNull:false
    },
    shippingFee:{
      type:DataTypes.DECIMAL(10,2),
      defaultValue:0,
      allowNull:false,
      validate:{
        isDecimal:true,
        min:0
      }
    }, 
    discountAmout: {
      type:DataTypes.DECIMAL(10,2),
      defaultValue:0,
      allowNull:false,
      validate:{
        isDecimal:true,
        min:0
      }
    },
    taxAmount: {
      type:DataTypes.DECIMAL(10,2),
      defaultValue:0,
      allowNull:false,
      validate:{
        isDecimal:true,
        min:0
      }
    },
    totalAmout: {
      type:DataTypes.DECIMAL(10,2),
      allowNull:false,
      validate:{
        isDecimal:true,
        min:0
      }
    },
    notes: DataTypes.TEXT,
    paidAt: {
      type:DataTypes.DATE,
      allowNull:false
    },
    completed: {
      type:DataTypes.DATE,
      allowNull:false
    },
  }, {
    sequelize,
    modelName: 'Order',
    underscored: true,
  });
  return Order;
};