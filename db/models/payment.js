'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Payment.belongsTo(models.Order, {
        foreignKey:'orderId',
        as:'order'
      });
    }
  }
  Payment.init({
    orderId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'orders',
        key:'id'
      }
    },
    paymentNumber: {
      type:DataTypes.STRING,
      allowNull:false,
    },
    paymentMethod: {
      type:DataTypes.ENUM('credit_card', 'bank_transfer', 'digital_payment'),
      allowNull:false
    },
    status:{
      type:DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
      defaultValue:'pending',
      allowNull:false
    },
    paymentDetails: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Payment',
    underscored: true,
  });
  return Payment;
};