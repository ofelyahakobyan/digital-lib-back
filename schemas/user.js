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
      firstName: Joi.string().alphanum().label('first name').required()
        .messages({
          'any.required': '{#label} is required',
          'string.alphanum': '{#label} may contain only letters or numbers',
          'string.empty': '{#label} is not allowed to be empty',
        }),
      lastName: Joi.string().alphanum().label('last name')
        .messages({ 'string.alphanum': '{#label} may contain only letters or numbers' }),
      password: Joi.string().min(4).label('password').required()
        .messages({
          'any.required': '{#label} is required',
          'string.min': '{#label} should contain at least 4 characters',
          'string.empty': '{#label} is not allowed to be empty',
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
