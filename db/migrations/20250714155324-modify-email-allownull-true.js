'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true, // 允許 password 欄位為 null
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'password');
  }
};
