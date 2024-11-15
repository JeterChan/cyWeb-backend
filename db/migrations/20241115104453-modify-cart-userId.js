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
    await queryInterface.sequelize.transaction(async(transaction) => {
      await queryInterface.changeColumn('Carts','user_id',{
        type:Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        allowNull:false,
        unique:true,
        references: {
          model:'users',
          key:'id'
        }
      },{transaction});

      await queryInterface.addColumn('Carts','session_id', {
        type:Sequelize.STRING,
        allowNull:true
      },{transaction})
    })
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.transaction(async(transaction) => {
      await queryInterface.changeColumn('Carts','user_id',{
        type:Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        allowNull:false,
        unique:true,
        references: {
          model:'users',
          key:'uuid'
        }
      },{transaction});
      await queryInterface.removeColumn('Carts','session_id',{transaction});
    })
  }
};
