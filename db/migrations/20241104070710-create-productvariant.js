'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Productvariants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      sku: {
        type: Sequelize.STRING,
        allowNull:false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false
      },
      specification: {
        type: Sequelize.JSON,
      },
      status: {
        type: Sequelize.ENUM('active','inactive'),
        defaultValue:'inactive'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'Products',
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
    await queryInterface.dropTable('Productvariants');
  }
};