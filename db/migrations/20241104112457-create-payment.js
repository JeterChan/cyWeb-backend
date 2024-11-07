'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
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
      payment_number: {
        type: Sequelize.STRING,
        allowNull:false
      },
      payment_method: {
        type: Sequelize.ENUM('credit_card', 'bank_transfer', 'digital_payment'),
        allowNull:false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
        defaultValue:'pending',
        allowNull:false
      },
      payment_details: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable('Payments');
  }
};