import Joi from 'joi';

const categories = {
  add: {
    body: Joi.object({
      category: Joi.string().trim().regex(/^[a-zA-Z]+$/).required(),
      parentCategory: Joi.string().trim().regex(/^[a-zA-Z]+$/),
    }),
  },
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(20),
    }),
  },
  edit: {
    params: Joi.object({ categoryId: Joi.number().integer().min(1).required() }),
    body: Joi.object({
      category: Joi.string().trim().regex(/^[a-zA-Z]+$/),
      parentCategory: Joi.string().trim().regex(/^[a-zA-Z]+$/),
    }),
  },
  single: { params: Joi.object({ category: Joi.string().pattern(/^[a-zA-Z0-9\s-]+$/).required() }) },
};
export default categories;
