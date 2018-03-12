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

  // User.associate = (models) => {
  //   User.hasMany(models.Recipe, {
  //     foreignKey: 'userId',
  //     as: 'recipes'
  //   });
  //   User.hasMany(models.Review, {
  //     foreignKey: 'userId',
  //     as: 'reviews'
  //   });
  //   User.hasMany(models.Favorite, {
  //     foreignKey: 'userId',
  //     as: 'favorites'
  //   });
  //   User.hasMany(models.Voting, {
  //     foreignKey: 'userId',
  //     as: 'votings'
  //   });
  // };

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
// const userSchema = new mongoose.Schema({
//   passwordResetToken: String,
//   passwordResetExpires: Date,

//   facebook: String,
//   twitter: String,
//   google: String,
//   github: String,
//   instagram: String,
//   linkedin: String,
//   steam: String,
//   tokens: Array,

//   profile: {
//     name: String,
//     gender: String,
//     location: String,
//     website: String,
//     picture: String
//   }
// });

// /**
//  * Password hash middleware.
//  */
// userSchema.pre('save', function save(next) {
//   const user = this;
//   if (!user.isModified('password')) { return next(); }
//   bcrypt.genSalt(10, (err, salt) => {
//     if (err) { return next(err); }
//     bcrypt.hash(user.password, salt, null, (err, hash) => {
//       if (err) { return next(err); }
//       user.password = hash;
//       next();
//     });
//   });
// });

// /**
//  * Helper method for validating user's password.
//  */
// userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
//   bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
//     cb(err, isMatch);
//   });
// };

// /**
//  * Helper method for getting user's gravatar.
//  */
// userSchema.methods.gravatar = function gravatar(size) {
//   if (!size) {
//     size = 200;
//   }
//   if (!this.email) {
//     return `https://gravatar.com/avatar/?s=${size}&d=retro`;
//   }
//   const md5 = crypto.createHash('md5').update(this.email).digest('hex');
//   return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
// };
