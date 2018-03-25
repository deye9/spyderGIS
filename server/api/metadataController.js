import Validator from 'validatorjs';
import models from '../models';

const User = models.User;
const Meta = models.Metadata;

const metadataController = {
  retrieve(req, res) {
    return Meta.findAll({
      where:
      {
        category: req.params.category,
        created_by: req.decoded.UserID
      },
      include: [
        {
          model: models.User,
          attributes: ['firstname', 'lastname', 'email']
        }
      ]
    })
      .then((foundMeta) => {
        if (!foundMeta) {
          return Promise.reject({ code: 404, message: 'Metadata not found', success: false });
        }
        return foundMeta;
      })
      .then((foundMeta) => {
        return res.status(200).json({
          success: true,
          data: foundMeta
        });
      })
      .catch(error => res.status(500).json({
        error: error,
        success: false,
        message: error.message
      }));
  },
  create(req, res) {
    const body = req.body;
    const validator = new Validator(body, Meta.createRules());

    console.log(body);
    console.log(req.user);
    console.log(req.decoded);

    if (validator.passes()) {
      Meta.findOne(
        {
          where: {
            category: body.category,
            created_by: req.decoded.UserID,
            description: body.description,
            status: body.status
          }
        })
        .then((foundMeta) => {
          if (foundMeta) {
            return res.status(409).json({
              success: false,
              message: 'You have this Metadata already, please edit it.'
            });
          }
          Meta.create({
            status: body.status,
            category: body.category,
            created_by: req.decoded.UserID,
            description: body.description
          })
            .then(newMeta => res.status(201).json({
              data: newMeta,
              success: true,
              message: 'Metadata was successfully created.'
            }))
            .catch(error => res.status(400).json(error));
        })
        .catch(error => res.status(500).json({
          error: error,
          success: false,
          message: error.message
        }));
    } else {
      return res.status(400).json({
        success: false,
        errors: validator.errors.all(),
        message: 'A validation error occurred'
      });
    }
  },
  update(req, res) {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('account/login', {
      title: 'Login'
    });
  },
  destroy(req, res) {
    if (req.user) {
      return res.redirect('/');
    }
    res.render('account/login', {
      title: 'Login'
    });
  },
};

export default metadataController;
