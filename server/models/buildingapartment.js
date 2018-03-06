module.exports = (sequelize, DataTypes) => {
  const BuildingApartment = sequelize.define('BuildingApartment', {
    apartments: {
      allowNull: false,
      type: DataTypes.STRING
    },
    building_log: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    timestamps: true,
  });

  BuildingApartment.associate = (models) => {
    models.define = {};
    // associations can be defined here
  };

  return BuildingApartment;
};
