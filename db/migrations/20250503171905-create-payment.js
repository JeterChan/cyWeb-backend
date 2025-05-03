'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      payment_number: {
        type: Sequelize.STRING,
        allowNull: false
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      payment_details: {
        type: Sequelize.JSON
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // ✅ 加入 CHECK constraint 限制 payment_method
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      ADD CONSTRAINT payment_method_check
      CHECK (payment_method IN ('credit_card', 'bank_transfer', 'digital_payment'));
    `);

    // ✅ 加入 CHECK constraint 限制 status
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      ADD CONSTRAINT payment_status_check
      CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};
