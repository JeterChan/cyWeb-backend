'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_number: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      base_price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false
      },
      description: {
        type: Sequelize.JSON,
        allowNull:false
      },
      specification: {
        type: Sequelize.JSON,
        allowNull:false
      },
      state: {
        type: Sequelize.ENUM('active','inactive'),
        defaultValue:'inactive'
      },
      image: {
        type: Sequelize.STRING
      },
      subcategory_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'Subcategories',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  }
};