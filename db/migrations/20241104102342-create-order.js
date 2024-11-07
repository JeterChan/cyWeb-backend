'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'users',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'processing', 'completed'),
        defaultValue:'pending',
        allowNull:false
      },
      order_number: {
        type: Sequelize.STRING,
        allowNull:false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false
      },
      shipping_fee: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false
      },
      discount_amout: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false
      },
      total_amout: {
        type: Sequelize.DECIMAL(10,2),
        allowNull:false
      },
      notes: {
        type: Sequelize.TEXT
      },
      completed: {
        type: Sequelize.DATE,
        allowNull:false
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull:false
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
    await queryInterface.dropTable('Orders');
  }
};