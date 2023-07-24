import Joi from 'joi';

const books = {
  list: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(9),
    }),
  },
  authorList: {
    params: Joi.object({ authorId: Joi.number().integer().min(1).required() }),
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(9),
    }),
  },
};
export default books;
