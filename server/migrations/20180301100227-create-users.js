module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('users', {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      firstname: {
        allowNull: false,
        type: Sequelize.STRING(30)
      },
      lastname: {
        allowNull: false,
        type: Sequelize.STRING(30)
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(45)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      picture: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true
      },
      passwordResetExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      facebook: {
        type: Sequelize.STRING,
        allowNull: true
      },
      twitter: {
        type: Sequelize.STRING,
        allowNull: true
      },
      google: {
        type: Sequelize.STRING,
        allowNull: true
      },
      github: {
        type: Sequelize.STRING,
        allowNull: true
      },
      instagram: {
        type: Sequelize.STRING,
        allowNull: true
      },
      linkedin: {
        type: Sequelize.STRING,
        allowNull: true
      },
      steam: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tokens: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true
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
          fields: ['email']
        }
      ]
    }),
  down: (queryInterface) => {
    queryInterface.dropTable('users');
  },
};
