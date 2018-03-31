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
      ],
      order: [
        ['id', 'DESC']
      ]
    })
      .then((foundMeta) => {
        if (!foundMeta) {
          return res.status(404).json({
            success: false,
            message: 'Metadata not found',
          });
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
            description: body.description
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
    const body = {
      category: req.body.category,
      created_by: req.decoded.UserID
    };
    const _id = req.body.pk;

    switch (req.body.name.toLowerCase()) {
      case 'status':
        body.status = req.body.value;
        break;

      case 'description':
        body.description = req.body.value;
        break;

      default:
        break;
    }

    return Meta
      .findById(_id)
      .then((meta) => {
        if (!meta) {
          return res.status(404).send({
            success: false,
            message: `${body.category} metadata Not Found`,
          });
        }
        if (req.decoded.UserID !== meta.created_by) {
          return res.status(404).json({
            success: false,
            message: `You have no access to edit this ${body.category} metadata.`
          });
        }

        return meta
          .update(body, { fields: Object.keys(body) })
          .then(() => res.status(201).json({
            data: meta,
            success: true,
            message: `${body.category} metadata successfully updated.`
          }))
          .catch(error => res.status(400).json({
            success: false,
            errors: error.errors,
            message: `${body.category} metadata not updated.`
          }));
      })
      .catch(error => res.status(500).json({ errors: error.errors }));
  },
  destroy(req, res) {
    return Meta
      .findById(req.params.category)
      .then((meta) => {
        if (!meta) {
          return res.status(404).send({
            success: false,
            message: 'Metadata Not Found'
          });
        }
        if (req.decoded.UserID !== meta.created_by) {
          return res.status(404).json({
            success: false,
            message: 'You have no access to remove this metadata.'
          });
        }
        return meta
          .destroy()
          .then(() => res.status(200).json({
            success: true,
            id: req.params.category,
            message: 'MetaData has been successfully deleted.'
          }))
          .catch(error => res.status(400).json({
            success: false,
            errors: error.errors,
            message: 'Metadata was not removed as requested.'
          }));
      })
      .catch(error => res.status(500).json({ errors: error.errors }));
  },
};

export default metadataController;
