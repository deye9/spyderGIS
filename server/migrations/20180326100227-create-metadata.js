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
        type: Sequelize.ENUM('Drainage', 'Road Type', 'Site Condition', 'Road Surface', 'Road Feature', 'Building Type', 'Refuse Disposal', 'Road Condition', 'Street Furniture', 'Road Carriage Type'),
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
