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
    await queryInterface.removeColumn('orders','paid_at');
    await queryInterface.removeColumn('orders','completed');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('orders','paid_at',{
      type:Sequelize.DATE,
      allowNull:false
    });
    await queryInterface.addColumn('orders','completed',{
      type:Sequelize.DATE,
      allowNull:false
    });
  }
};
