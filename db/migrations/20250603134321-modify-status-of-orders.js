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
     await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('cancel', 'delivered', 'processing', 'completed'),
      allowNull: false,
      defaultValue: 'processing'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('pending', 'paid', 'processing', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
};
