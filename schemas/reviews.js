import Joi from 'joi';

const reviews = {
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(10),
    }),
  },
  userList: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(10),
    }),
  },
  userEdit: {
    params: Joi.object({ reviewId: Joi.number().integer().min(1).required() }),
    body: Joi.object({
      title: Joi.string().trim().regex(/^[a-zA-Z0-9\s]+$/),
      content: Joi.string().trim().regex(/^[a-zA-Z0-9\s]+$/),
      rating: Joi.number().integer().min(1).max(5),
    }),
  },
  userDelete: { params: Joi.object({ reviewId: Joi.number().integer().min(1).required() }) },
  add: {
    params: Joi.object({ bookId: Joi.number().integer().min(1).required() }),
    body: Joi.object({
      title: Joi.string().trim().regex(/^[a-zA-Z0-9\s]+$/).required(),
      content: Joi.string().trim().regex(/^[a-zA-Z0-9\s]+$/),
      rating: Joi.number().integer().min(1).max(5)
        .required(),
    }),
  },

  adminEdit: {
    params: Joi.object({ reviewId: Joi.number().integer().min(1).required() }),
    body: Joi.object({
      title: Joi.string().trim().regex(/^[a-zA-Z0-9\s]+$/),
      content: Joi.string().trim().regex(/^[a-zA-Z0-9\s]+$/),
    }),
  },
  adminDelete: { params: Joi.object({ reviewId: Joi.number().integer().min(1).required() }) },
  bookList: {
    params: Joi.object({ bookId: Joi.number().integer().min(1).required() }),
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(10),
    }),
  },
};
export default reviews;
