import bcrypt from 'bcrypt-nodejs';

const userModel = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    firstname: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    google: {
      type: DataTypes.STRING,
      allowNull: true
    },
    github: {
      type: DataTypes.STRING,
      allowNull: true
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true
    },
    linkedin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    steam: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tokens: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    } },
  {
    timestamps: true,
    paranoid: true,
    underscored: true
  });

  /**
    * Method for comparing passwords
    * @param { object } user
    * @param { string } password
    *
    * @returns { object } user
  */
  User.prototype.comparePassword = (user, password) =>
    bcrypt.compareSync(password, user.password);

  /**
    * Hook for hashing password before creating a new user
  */
  User.hook('beforeCreate', (user) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);
    user.password = hash;
  });

  /**
    * auth validation rules for user creation and login
    * @returns { object } object
  */
  User.createRules = () => ({
    firstname: 'required|alpha',
    lastname: 'required|alpha',
    email: 'required|email',
    password: 'required|min:6'
  });

  User.loginRules = () => ({
    email: 'required|email',
    password: 'required'
  });
  return User;
};

export default userModel;
