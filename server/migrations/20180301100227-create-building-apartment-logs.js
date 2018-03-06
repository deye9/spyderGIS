module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('buildingapartmentlogs', {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      apartment_desc: {
        allowNull: false,
        type: Sequelize.STRING
      },
      apartment_use: {
        allowNull: false,
        type: Sequelize.STRING
      },
      buildingid: {
        allowNull: false,
        type: Sequelize.STRING
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
    queryInterface.dropTable('buildingapartmentlogs');
  },
};
