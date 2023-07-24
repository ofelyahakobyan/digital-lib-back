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
      minPrice: Joi.number().min(0),
      maxPrice: Joi.number().min(99999999),
      rating: Joi.number().integer().min(0).max(5),
      format: Joi.array().items(Joi.string()).default([]),
      languages: Joi.array().items(Joi.string().regex(/^[a-zA-Z]+$/)).default([]),
      authorIds: Joi.array().items(Joi.number().integer().min(1)).default([]),
      categoryIds: Joi.array().items(Joi.number().integer().min(1)).default([]),
      popular: Joi.string().regex(/^[01]$/),
      brandNew: Joi.string().regex(/^[01]$/),
      bestseller: Joi.string().regex(/^[01]$/),
    }),

    q: Joi.string(),
  },
  authorList: {
    params: Joi.object({ authorId: Joi.number().integer().min(1).required() }),
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(4),
    }),
  },
  categoryList: {
    params: Joi.object({ categoryId: Joi.number().integer().min(1).required() }),
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(4),
    }),
  },
};
export default books;
