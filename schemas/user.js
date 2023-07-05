import Joi from 'joi';

const users = {
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).messages({
        'number.integer': '{#key} must be an integer',
        'number.max': '{#key} must be less than or equal to 20',
        'number.min': '{#key} must be more than or equal to 1',
        'number.base': 'must be a number',
      }),
      limit: Joi.number().integer().min(1).max(20)
        .messages({
          'number.integer': '{#key} must be an integer',
          'number.max': '{#key} must be less than or equal to 20',
          'number.min': '{#key} must be more than or equal to 1',
          'number.base': 'must be a number',
        }),
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
      firstName: Joi.string().alphanum().label('first name').required()
        .messages({
          'any.required': 'is required',
          'string.alphanum': 'may contain only letters or numbers',
          'string.empty': 'is not allowed to be empty',
        }),
      lastName: Joi.string().alphanum().label('last name')
        .messages({
          'string.alphanum': 'may contain only letters or numbers',
          'string.empty': 'is not allowed to be empty',
        }),
      password: Joi.string().min(4).label('password').required()
        .messages({
          'any.required': 'is required',
          'string.min': 'should contain at least 4 characters',
          'string.empty': 'is not allowed to be empty',
        }),
      email: Joi.string().email().lowercase().trim()
        .required()
        .messages({
          'any.required': 'is required',
          'string.email': 'must be a valid email address',
          'string.empty': 'is not allowed to be empty',
        }),
    }),
  },
};
export default users;
