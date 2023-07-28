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
      popular: Joi.boolean().default(false),
      brandNew: Joi.string().default(false),
      bestseller: Joi.string().default(false),
      q: Joi.string(),
    }),
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
  single: { params: Joi.object({ bookId: Joi.number().integer().min(1).required() }) },
  add: {
    body: Joi.object({
      title: Joi.string().trim().max(255).required(),
      price: Joi.number().min(0).max(9999999).required(),
      description: Joi.string().trim().min(3).max(32000),
      language: Joi.string().pattern(/^[a-zA-Z]+$/).required(),
      authorId: Joi.number().integer().min(1).required(),
      categories: Joi.array().items(Joi.number().integer().min(1)).required(),
      popular: Joi.boolean().default(false),
      brandNew: Joi.boolean().default(false),
      bestseller: Joi.boolean().default(false),
    }),
  },
  edit: {
    params: Joi.object({ bookId: Joi.number().integer().min(1).required() }),
    body: Joi.object({
      title: Joi.string().trim().max(255),
      price: Joi.number().min(0).max(9999999),
      description: Joi.string().trim().min(3).max(32000),
      language: Joi.string().pattern(/^[a-zA-Z]+$/),
      authorId: Joi.number().integer().min(1),
      categories: Joi.array().items(Joi.number().integer().min(1)),
      popular: Joi.boolean().default(false),
      brandNew: Joi.boolean().default(false),
      bestseller: Joi.boolean().default(false),
    }),
  },
  delete: { params: Joi.object({ bookId: Joi.number().integer().min(1).required() }) },

};
export default books;
