'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Subcategory,{
        foreignKey:'subcategoryId',
        as:'subcategory'
      });

      Product.hasMany(models.CartItem, {
        foreignKey:'productId',
        as:'cartItems'
      });

      Product.hasMany(models.OrderItem, {
        foreignKey:'productId',
        as:'orderItems'
      })
    }
  }
  Product.init({
    productNumber: {
      type:DataTypes.STRING,
      allowNull:false
    },
    name:{
      type:DataTypes.STRING,
      allowNull:false
    },
    basePrice: { 
      type:DataTypes.DECIMAL(10,2),
      allowNull:false,
      validate:{
        isDecimal:true,
        min:0
      }
    },
    quantity:{
      type:DataTypes.INTEGER,
      allowNull:false,
      defaultValue:0
    },
    description: {
      type:DataTypes.STRING,
      defaultValue:null
    },
    specification: {
      type:DataTypes.STRING,
      defaultValue:null
    },
    state: {
      type:DataTypes.ENUM('active','inactive'),
      defaultValue:'inactive'
    },
    image: DataTypes.STRING,
    subcategoryId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'Subcategories',
        key:'id'
      }
    }
    
  }, {
    sequelize,
    modelName: 'Product',
    underscored: true,
  });
  return Product;
};