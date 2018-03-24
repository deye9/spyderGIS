import bluebird from 'bluebird';
import Validator from 'validatorjs';
import nodemailer from 'nodemailer';
import models from '../models';
import authMiddleWare from '../middleware/auth';

const User = models.user;
const crypto = bluebird.promisifyAll(require('crypto'));

const userController = {

  /**
   * GET /login
   * Login page.
   */
  getLogin(req, res) {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('account/login', {
      title: 'Login'
    });
  },

  /**
   * POST /login
   * Sign in using email and password.
   */
  postLogin(req, res) {
    const body = req.body;
    const validator = new Validator(body, User.loginRules());

    if (validator.passes()) {
      User.findOne({ where: { email: body.email } })
        .then((user) => {
          if (!user) {
            req.flash('errors', `Account with email address ${body.email} was not found.`);
            res.redirect('/login');
          } else if (!user.comparePassword(user, body.password)) {
            req.flash('errors', 'Invalid password.');
            res.redirect('/login');
          }
          const token = authMiddleWare.createToken(user);
          req.session.accessToken = token;
          return res.redirect('/dashboard');
        });
    }
  },

  /**
   * GET /logout
   * Log out.
   */
  logout(req, res) {
    // req.logout();
    req.session.accessToken = '';
    res.removeHeader('x-access-token');
    res.redirect('/');
  },

  /**
   * GET /signup
   * Signup page.
   */
  getSignup(req, res) {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('account/signup', {
      title: 'Create Account'
    });
  },

  /**
   * POST /signup
   * Create a new local account.
   */
  postSignup(req, res) {
    const body = req.body;
    const validator = new Validator(body, User.createRules());

    if (validator.passes()) {
      User.findOne({ where: { email: req.body.email } })
        .then((existingUser) => {
          if (existingUser) {
            req.flash('errors', { msg: `Account with that email address {${req.body.email}} already exists.` });
            return res.redirect('/signup');
          }

          User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email.toLowerCase(),
            password: req.body.password
          })
            .then((newUser) => {
              res.redirect('/login');
            });
        });
    }
  },

  /**
   * GET /account
   * Profile page.
   */
  getAccount(req, res) {
    res.render('account/profile', {
      title: 'Account Management'
    });
  },

  /**
   * POST /account/profile
   * Update profile information.
   */
  postUpdateProfile(req, res, next) {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
      req.flash('errors', errors);
      return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
      if (err) { return next(err); }
      user.email = req.body.email || '';
      user.profile.name = req.body.name || '';
      user.profile.gender = req.body.gender || '';
      user.profile.location = req.body.location || '';
      user.profile.website = req.body.website || '';
      user.save((err) => {
        if (err) {
          if (err.code === 11000) {
            req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
            return res.redirect('/account');
          }
          return next(err);
        }
        req.flash('success', { msg: 'Profile information has been updated.' });
        res.redirect('/account');
      });
    });
  },

  /**
   * POST /account/password
   * Update current password.
   */
  postUpdatePassword(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
      req.flash('errors', errors);
      return res.redirect('/account');
    }

    User.findById(req.user.id, (err, user) => {
      if (err) { return next(err); }
      user.password = req.body.password;
      user.save((err) => {
        if (err) { return next(err); }
        req.flash('success', { msg: 'Password has been changed.' });
        res.redirect('/account');
      });
    });
  },

  /**
   * POST /account/delete
   * Delete user account.
   */
  postDeleteAccount(req, res, next) {
    User.remove({ _id: req.user.id }, (err) => {
      if (err) { return next(err); }
      req.logout();
      req.flash('info', { msg: 'Your account has been deleted.' });
      res.redirect('/');
    });
  },

  /**
   * GET /account/unlink/:provider
   * Unlink OAuth provider.
   */
  getOauthUnlink(req, res, next) {
    const provider = req.params.provider;
    User.findById(req.user.id, (err, user) => {
      if (err) { return next(err); }
      user[provider] = undefined;
      user.tokens = user.tokens.filter(token => token.kind !== provider);
      user.save((err) => {
        if (err) { return next(err); }
        req.flash('info', { msg: `${provider} account has been unlinked.` });
        res.redirect('/account');
      });
    });
  },

  /**
   * GET /reset/:token
   * Reset Password page.
   */
  getReset(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .exec((err, user) => {
        if (err) { return next(err); }
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('/forgot');
        }
        res.render('account/reset', {
          title: 'Password Reset'
        });
      });
  },

  /**
   * POST /reset/:token
   * Process the reset password request.
   */
  postReset(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
      req.flash('errors', errors);
      return res.redirect('back');
    }

    const resetPassword = () =>
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .then((user) => {
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          return user.save().then(() => new Promise((resolve, reject) => {
            req.logIn(user, (err) => {
              if (err) { return reject(err); }
              resolve(user);
            });
          }));
        });

    const sendResetPasswordEmail = (user) => {
      if (!user) { return; }
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      return transporter.sendMail(mailOptions)
        .then(() => {
          req.flash('success', { msg: 'Success! Your password has been changed.' });
        });
    };

    resetPassword()
      .then(sendResetPasswordEmail)
      .then(() => { if (!res.finished) res.redirect('/'); })
      .catch(err => next(err));
  },

  /**
   * GET /forgot
   * Forgot Password page.
   */
  getForgot(req, res) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    res.render('account/forgot', {
      title: 'Forgot Password'
    });
  },

  /**
   * POST /forgot
   * Create a random token, then the send user an email with a reset link.
   */
  postForgot(req, res, next) {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
      req.flash('errors', errors);
      return res.redirect('/forgot');
    }

    const createRandomToken = crypto
      .randomBytesAsync(16)
      .then(buf => buf.toString('hex'));

    const setRandomToken = token =>
      User
        .findOne({ email: req.body.email })
        .then((user) => {
          if (!user) {
            req.flash('errors', { msg: 'Account with that email address does not exist.' });
          } else {
            user.passwordResetToken = token;
            user.passwordResetExpires = Date.now() + 3600000; // 1 hour
            user = user.save();
          }
          return user;
        });

    const sendForgotPasswordEmail = (user) => {
      if (!user) { return; }
      const token = user.passwordResetToken;
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      return transporter.sendMail(mailOptions)
        .then(() => {
          req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        });
    };

    createRandomToken
      .then(setRandomToken)
      .then(sendForgotPasswordEmail)
      .then(() => res.redirect('/forgot'))
      .catch(next);
  }
};

export default userController;
