import Validator from 'validatorjs';
import models from '../models';

const Lga = models.Lga;
const User = models.User;

const lgaController = {
  retrieve(req, res) {
    return Lga.findAll({
      where:
      {
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
      .then((foundLga) => {
        if (!foundLga) {
          return res.status(404).json({
            success: false,
            message: 'LGA not found',
          });
        }
        return foundLga;
      })
      .then((foundLga) => {
        return res.status(200).json({
          success: true,
          data: foundLga
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
      details: req.body.details,
      description: req.body.description,
      created_by: req.decoded.UserID
    };
    const validator = new Validator(body, Lga.createRules());
    if (validator.passes()) {
      Lga.findOne(
        {
          where: {
            status: body.status,
            details: body.details,
            description: body.description,
            created_by: req.decoded.UserID
          }
        })
        .then((foundLga) => {
          if (foundLga) {
            return res.status(409).json({
              success: false,
              message: 'You have this Lgadata already, please edit it.'
            });
          }
          Lga.create({
            status: body.status,
            details: body.details,
            description: body.description,
            created_by: req.decoded.UserID
          })
            .then(newLga =>
              res.status(201).json({
                data: newLga,
                success: true,
                message: `Lgadata was successfully created for ${body.details}.`
              })
            )
            .catch(Lgaerror => res.status(400).json({
              success: false,
              error: Lgaerror,
              message: Lgaerror.message
            }));
        })
        .catch(Lgaerror => res.status(500).json({
          success: false,
          error: Lgaerror,
          message: Lgaerror.message
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
      details: req.body.details,
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

    return Lga
      .findById(_id)
      .then((Lga) => {
        if (!Lga) {
          return res.status(404).send({
            success: false,
            message: `${body.details} Lgadata Not Found`,
          });
        }
        if (req.decoded.UserID !== Lga.created_by) {
          return res.status(404).json({
            success: false,
            message: `You have no access to edit this ${body.details} Lgadata.`
          });
        }

        return Lga
          .update(body, { fields: Object.keys(body) })
          .then(() => res.status(201).json({
            data: Lga,
            success: true,
            message: `${body.details} Lgadata successfully updated.`
          }))
          .catch(error => res.status(400).json({
            success: false,
            errors: error.errors,
            message: `${body.details} Lgadata not updated.`
          }));
      })
      .catch(error => res.status(500).json({ errors: error.errors }));
  },
  destroy(req, res) {
    return Lga
      .findById(req.params.details)
      .then((Lga) => {
        if (!Lga) {
          return res.status(404).send({
            success: false,
            message: 'Lgadata Not Found'
          });
        }
        if (req.decoded.UserID !== Lga.created_by) {
          return res.status(404).json({
            success: false,
            message: 'You have no access to remove this Lgadata.'
          });
        }
        return Lga
          .destroy()
          .then(() => res.status(200).json({
            success: true,
            id: req.params.details,
            message: 'LgaData has been successfully deleted.'
          }))
          .catch(error => res.status(400).json({
            success: false,
            errors: error.errors,
            message: 'Lgadata was not removed as requested.'
          }));
      })
      .catch(error => res.status(500).json({ errors: error.errors }));
  },
};

export default lgaController;
