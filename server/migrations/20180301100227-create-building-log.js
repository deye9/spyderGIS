module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('buildinglog', {
      id: {
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      roadid: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      sitecondition: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      buildingtype: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      primarycategory: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      secondarycategory: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      housenumber: {
        allowNull: false,
        type: Sequelize.STRING
      },
      w3w: {
        allowNull: false,
        type: Sequelize.STRING
      },
      x: {
        allowNull: false,
        type: Sequelize.GEOMETRY
      },
      y: {
        allowNull: false,
        type: Sequelize.GEOMETRY
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
    queryInterface.dropTable('buildinglog');
  },
};
