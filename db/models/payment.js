'use strict';
const {
  Model
} = require('sequelize');

const PAYMENT_METHODS = ['credit_card', 'bank_transfer', 'digital_payment','cod','remittance'];
const PAYMENT_STATUSES = ['pending', 'processing', 'completed', 'failed', 'refunded'];

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
    }
  }

  Payment.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    paymentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [PAYMENT_METHODS]
      }
    },
    amount:{
      type:DataTypes.DECIMAL(10,2),
      allowNull:false,
      comment: '付款金額，單位為元（不含稅）',
      validate:{
        // 未來若有退款的話會有負的
        isDecimal: true
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [PAYMENT_STATUSES]
      }
    },
    paymentDetails: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Payment',
    underscored: true,
  });

  return Payment;
};
