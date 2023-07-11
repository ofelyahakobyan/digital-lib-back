import Joi from 'joi';

const authors = {
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).messages({
        'number.integer': 'must be an integer',
        'number.min': 'must be more than or equal to 1',
        'number.base': 'must be a number',
      }),
      limit: Joi.number().integer().min(1).max(4)
        .messages({
          'number.integer': 'must be an integer',
          'number.max': 'must be less than or equal to 4',
          'number.min': 'must be more than or equal to 1',
          'number.base': 'must be a number',
        }),
    }),
  },
  // create: {},
};
export default authors;
