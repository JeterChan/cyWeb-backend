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
    await queryInterface.addColumn('orders','company', {
      type:Sequelize.STRING,
      allowNull:true,
    });
    await queryInterface.addColumn('orders','customer_name',{
      type:Sequelize.STRING,
      allowNull:false,
    });
    await queryInterface.addColumn('orders', 'customer_email',{
      type:Sequelize.STRING,
      allowNull:false,
    });
    await queryInterface.addColumn('orders','customer_phone',{
      type:Sequelize.STRING,
      allowNull:false
    });
    await queryInterface.addColumn('orders','invoice_title',{
      type:Sequelize.STRING,
      allowNull:true,
    });
    await queryInterface.addColumn('orders','tax_id',{
      type:Sequelize.STRING,
      allowNull:true,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('orders','company');
    await queryInterface.removeColumn('orders','customer_name');
    await queryInterface.removeColumn('orders','customer_email');
    await queryInterface.removeColumn('orders','customer_phone');
    await queryInterface.removeColumn('orders','invoice_title');
    await queryInterface.removeColumn('orders','tax_id');
  }
};
