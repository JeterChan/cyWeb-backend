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
    await Promise.all([
      queryInterface.addColumn('Users', 'is_verified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }),
      queryInterface.addColumn('Users', 'verification_token', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('Users', 'token_expires_at', {
        type: Sequelize.DATE,
        allowNull: true
      })
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await Promise.all([
      queryInterface.removeColumn('Users', 'is_verified'),
      queryInterface.removeColumn('Users', 'verification_token'),
      queryInterface.removeColumn('Users', 'token_expires_at')
    ]);
  }
};
