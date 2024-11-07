'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'orders',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE'
      },
      product_variant_id: {
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'productvariants',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull:false,
      },
      unit_price: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false,
      },
      variant_attributes: {
        type: Sequelize.JSON
      },
      subtotal: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false,
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
    await queryInterface.dropTable('OrderItems');
  }
};