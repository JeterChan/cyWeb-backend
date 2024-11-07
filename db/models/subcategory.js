'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subcategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subcategory.belongsTo(models.Category, {
        foreignKey:'categoryId',
        as:'category'
      }),
      Subcategory.hasOne(models.Product, {
        foreignKey:'subcategoryId',
        as:'products'
      })
    }
  }
  Subcategory.init({
    name: {
      type:DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:true
      }
    },
    categoryId: {
      type:DataTypes.INTEGER,
      allowNull:false,
      references:{
        model:'Categories',
        key:'id'
      }
    },
    slug:{
      type:DataTypes.STRING,
      allowNull:false,
    }
  }, {
    sequelize,
    modelName: 'Subcategory',
    underscored:true
  });
  return Subcategory;
};