module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('metadata', {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING
      },
      status: {
        allowNull: true,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      category: {
        allowNull: false,
        type: Sequelize.ENUM('Building Type', 'Drainage Description', 'Collection Description', 'Road Carriage Description', 'Road Condition', 'Road Feature', 'Road Surface', 'Street Furniture', 'Primary Category', 'Road Type', 'Site Condition', 'Secondary')
      },
      created_by: {
        allowNull: false,
        type: Sequelize.INTEGER
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
    }),
  down: (queryInterface) => {
    queryInterface.dropTable('metadata');
  },
};
