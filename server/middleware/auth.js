import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // used to create, sign, and verify tokens
import models from '../models';

dotenv.config();
const User = models.User;
const secret = process.env.SECRET_TOKEN;

const auth = {
  createToken(user) {
    return jwt.sign({
      UserID: user.id,
      Email: user.email,
    }, secret, { expiresIn: '24 hours' });
  },
  verifyToken(req, res, next) {
    const token = req.session.accessToken || res.getHeader('x-access-token');
    if (token) {
      jwt.verify(token, secret, (error, decoded) => {
        if (error) {
          return next(auth.handleResponse(req, res, 'Invalid authorization token', 401));
        }

        User.findOne({ where: { id: decoded.UserID } })
          .then((user) => {
            if (!user) {
              return next(auth.handleResponse(req, null, 'This user does not exist', null));
            }
            req.decoded = decoded;
            return next();
          })
          .catch(err => next(auth.handleResponse(req, res, json(err), 404)));
      });
    } else {
      return next(auth.handleResponse(req, res, 'Token not provided', 403));
    }
  },
  verifyUser(req, res, next) {
    User.findById(req.decoded.UserID)
      .then((user) => {
        if (user) {
          req.user = user;
          return next();
        }
        return res.status(404).json({ message: 'User not found' });
      })
      .catch(error => res.status(500).json({ error: error.message }));
  },
  handleResponse(req, res, message, statusCode) {
    const isAjaxRequest = (req.xhr || req.headers.accept.indexOf('json') > -1);
    if (statusCode !== null && isAjaxRequest) {
      return res.status(statusCode).json(message);
    } else if (isAjaxRequest) {
      return Promise.reject(message);
    }
    return Error(message);
  }
};

export default auth;
