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
      queryInterface.addColumn('users', 'is_verified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }),
      queryInterface.addColumn('users', 'verification_token', {
        type: Sequelize.STRING,
        allowNull: true
      }),
      queryInterface.addColumn('users', 'token_expires_at', {
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
      queryInterface.removeColumn('users', 'is_verified'),
      queryInterface.removeColumn('users', 'verification_token'),
      queryInterface.removeColumn('users', 'token_expires_at')
    ]);
  }
};
