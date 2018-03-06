module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('password_resets', {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(45)
      },
      token: {
        allowNull: true,
        type: Sequelize.STRING
      },
      expiry: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      done: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['email', 'token']
        }
      ]
    }),
  down: (queryInterface) => {
    queryInterface.dropTable('password_resets');
  },
};
