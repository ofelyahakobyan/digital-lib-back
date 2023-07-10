import Joi from 'joi';

const categories = {
  create: {
    body: Joi.object({
      category: Joi.string()
        .regex(/^[a-zA-Z]+$/)
        .required()
        .messages({
          'string.empty': 'cannot be an empty string',
          'any.required': 'is required',
          'string.pattern.base': 'should contain only letters',
          'string:base': 'should be a string',
        }),
      parentCategory: Joi.string()
        .regex(/^[a-zA-Z]+$/)
        .messages({
          'string.empty': 'cannot be an empty string',
          'string.pattern.base': 'should contain only letters',
          'string:base': 'should be a string',
        }),
    }),
  },
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).messages({
        'number.integer': 'must be an integer',
        'number.max': ' must be less than or equal to 20',
        'number.min': 'must be more than or equal to 1',
        'number.base': 'must be a number',
      }),
      limit: Joi.number().integer().min(1).max(10)
        .messages({
          'number.integer': 'must be an integer',
          'number.max': 'must be less than or equal to 20',
          'number.min': 'must be more than or equal to 1',
          'number.base': 'must be a number',
        }),
    }),
  },
};
export default categories;
