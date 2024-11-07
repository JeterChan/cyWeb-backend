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
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('Products','description',{
        type:Sequelize.STRING,
        defaultValue:null
      },{transaction});

      await queryInterface.changeColumn('Products','specification', {
        type:Sequelize.STRING,
        defaultValue:null
      }, {transaction});

    });
    

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('Products','description',{
        type:Sequelize.JSON,
        defaultValue:null
      },{transaction});

      await queryInterface.changeColumn('Products','specification', {
        type:Sequelize.JSON,
        defaultValue:null
      }, {transaction});
    })
  }
};
