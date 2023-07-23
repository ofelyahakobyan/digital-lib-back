import Joi from 'joi';

const users = {
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(20),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().lowercase().required(),
      password: Joi.string().min(4).required(),
    }),
  },
  registration: {
    body: Joi.object({
      firstName: Joi.string().trim(true).alphanum().min(3)
        .max(100)
        .required(),
      lastName: Joi.string().trim().alphanum().min(3)
        .max(100),
      password: Joi.string().min(4).required(),
      email: Joi.string().email().lowercase().trim()
        .required(),
    }),
  },
  edit: {
    body: Joi.object({
      firstName: Joi.string().trim().alphanum().min(3)
        .max(100),
      lastName: Joi.string().trim().alphanum().min(3)
        .max(100),
      nikName: Joi.string().trim().alphanum(),
      country: Joi.string().trim().pattern(/^[A-Za-z]+$/),
      dob: Joi.date(),
      shortAbout: Joi.string().trim().alphanum().min(3),
      phone: Joi.string().pattern(/^[0-9\s]+$/),
    }),
  },
  changePassword: {
    body: {
      currentPassword: Joi.string().min(4).required(),
      newPassword: Joi.string().min(4).required(),
    },
  },
  passwordForgot: {
    body: {
      email: Joi.string().email().lowercase().trim()
        .required(),
    },
  },
  passwordReset: {
    body: {
      email: Joi.string().email().lowercase().trim()
        .required(),
      newPassword: Joi.string().trim().min(4).required(),
      code: Joi.string(),
    },
  },
  reviews: {
    query: Joi.object({
      page: Joi.number().integer().min(1).messages({
        'number.integer': 'must be an integer',
        'number.max': 'must be less than or equal to 20',
        'number.min': 'must be more than or equal to 1',
        'number.base': 'must be a number',
      }),
      limit: Joi.number().integer().min(1).max(20)
        .messages({
          'number.integer': 'must be an integer',
          'number.max': 'must be less than or equal to 20',
          'number.min': 'must be more than or equal to 1',
          'number.base': 'must be a number',
        }),
    }),
  },
};
export default users;
