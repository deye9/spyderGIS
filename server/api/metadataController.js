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
        error,
        success: false,
        message: error.message
      }));
  },
  create(req, res) {
    const body = {
      status: req.body.status,
      category: req.body.category,
      description: req.body.description,
      created_by: req.decoded.UserID
    };
    const validator = new Validator(body, Meta.createRules());

    if (validator.passes()) {
      Meta.findOne(
        {
          where: {
            status: body.status,
            category: body.category,
            description: body.description,
            created_by: req.decoded.UserID
          }
        })
        .then((foundMeta) => {
          if (foundMeta) {
            return Promise.reject({ code: 409, message: 'You have this Metadata already, please edit it.', success: false });

            // return res.status(409).json({
            //   success: false,
            //   message: 'You have this Metadata already, please edit it.'
            // });
          }
          Meta.create({
            status: body.status,
            category: body.category,
            description: body.description,
            created_by: req.decoded.UserID
          })
            .then(newMeta =>
              res.status(201).json({
                data: newMeta,
                success: true,
                message: `Metadata was successfully created for ${body.category}.`
              })
            )
            .catch(metaerror => res.status(400).json({
              success: false,
              error: metaerror,
              message: metaerror.message
            }));
        })
        .catch(metaerror => res.status(500).json({
          success: false,
          error: metaerror,
          message: metaerror.message
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
