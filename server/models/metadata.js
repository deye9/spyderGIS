
const metadataModel = (sequelize, DataTypes) => {
  const Metadata = sequelize.define('Metadata', {
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('Drainage', 'Road Type', 'Site Condition', 'Road Surface', 'Road Feature', 'Building Type', 'Refuse Disposal', 'Road Condition', 'Street Furniture', 'Road Carriage Type'),
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
    tableName: 'metadata'
  });

  Metadata.associate = (models) => {
    Metadata.belongsTo(models.User, {
      foreignKey: 'created_by',
      onDelete: 'CASCADE'
    });
  };

  /**
    * Validation rules for metadata creation.
    * @returns { object } object
  */
  Metadata.createRules = () => ({
    description: 'required|alpha',
    status: 'required|boolean',
    category: 'required|alpha',
    created_by: 'required|integer'
  });

  return Metadata;
};

export default metadataModel;
