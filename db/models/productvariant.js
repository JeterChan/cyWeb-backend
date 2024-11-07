'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductVariant.belongsTo(models.Product, {
        foreignKey:'productId',
        as:'product'
      });

      ProductVariant.hasMany(models.CartItem, {
        foreignKey:'productVariantId',
        as:'cartItems'
      });

      ProductVariant.hasMany(models.OrderItem, {
        foreignKey:'productVariantId',
        as:'productVariants'
      })
    }
  }
  ProductVariant.init({
    name: {
      type:DataTypes.STRING,
      allowNull:false
    },
    sku: {
      type:DataTypes.STRING,
      allowNull:false
    },
    quantity:{ 
      type:DataTypes.INTEGER,
      allowNull:false,
      defaultValue:0,
      validate:{
        isInt:true, // 確保是整數
        min:0
      }
    },
    price: {
      type:DataTypes.DECIMAL,
      allowNull:false,
      validate:{
        isDecimal:true,
        min:0
      }
    },
    specification: DataTypes.JSON,
    status: {
      type:DataTypes.ENUM('active','inactive'),
      defaultValue:'inactive'
    },
    product_id: {
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'Products',
        key:'id'
      }
    },
  }, {
    sequelize,
    modelName: 'ProductVariant',
    underscored: true,
  });
  return ProductVariant;
};