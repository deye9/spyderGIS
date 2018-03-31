
const lgaModel = (sequelize, DataTypes) => {
  const Lga = sequelize.define('Lga', {
    flag: {
      allowNull: false,
      type: DataTypes.STRING
    },
    continent: {
      allowNull: false,
      type: DataTypes.STRING
    },
    country: {
      allowNull: false,
      type: DataTypes.STRING
    },
    state: {
      allowNull: false,
      type: DataTypes.STRING
    },
    lga: {
      allowNull: false,
      type: DataTypes.STRING
    },
    area: {
      allowNull: false,
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    paranoid: true,
    timestamps: true,
    underscored: true,
    tableName: 'lga'
  });

  Lga.associate = (models) => {
    Lga.belongsTo(models.User, {
      foreignKey: 'created_by',
      onDelete: 'CASCADE'
    });
  };

  /**
    * Validation rules for metadata creation.
    * @returns { object } object
  */
  Lga.createRules = () => ({
    lga: 'required|string',
    area: 'required|string',
    flag: 'required|string',
    state: 'required|string',
    status: 'required|boolean',
    country: 'required|string',
    continent: 'required|string',
    created_by: 'required|integer'
  });

  return Lga;
};

export default lgaModel;
