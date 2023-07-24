import Joi from 'joi';

const userBooks = {
  wishlist: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(8),
    }),
  },
  cart: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(8),
    }),
  },
  add: { params: Joi.object({ bookId: Joi.number().integer().min(1).required() }) },
  delete: { params: Joi.object({ bookId: Joi.number().integer().min(1).required() }) },
};
export default userBooks;
