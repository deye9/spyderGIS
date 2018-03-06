module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('buildingapartments', {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      apartments: {
        allowNull: false,
        type: Sequelize.STRING
      },
      building_log: {
        allowNull: true,
        type: Sequelize.INTEGER,
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
        references: {
          model: 'buildinglog',
          key: 'id',
          as: 'building_log',
        },
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
    queryInterface.dropTable('buildingapartments');
  },
};
