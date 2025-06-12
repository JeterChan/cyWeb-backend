'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // 先移除舊的 contraint 
    await queryInterface.sequelize.query(`
      ALTER TABLE payments DROP CONSTRAINT payment_method_check;  
    `)

    // 加入新的 contraint 包含 'cod'
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      ADD CONSTRAINT payment_method_check
      CHECK (payment_method IN ('credit_card', 'bank_transfer', 'digital_payment','cod','remittance'));  
    `)
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // 恢復原本的 contraint (不含 'cod')
    await queryInterface.sequelize.query(`
      ALTER TABLE payments DROP CONSTRAINT payment_method_check; 
    `)

    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      ADD CONSTRAINT payment_method_check
      CHECK (payment_method IN ('credit_card', 'bank_transfer', 'digital_paymnet'));  
    `)
  }
};
