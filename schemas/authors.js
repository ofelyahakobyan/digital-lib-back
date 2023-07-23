import Joi from 'joi';

const authors = {
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(4),
    }),
  },
  single: { params: Joi.object({ authorId: Joi.number().integer().min(1).required() }) },
  add: {
    body: Joi.object({
      firstName: Joi.string().trim().alphanum().min(1)
        .max(100)
        .required(),
      lastName: Joi.string().trim().alphanum().min(1)
        .max(100),
      dob: Joi.date(),
      bio: Joi.string().alphanum().min(1).max(32000),
    }),
  },
  edit: {
    params: Joi.object({ authorId: Joi.number().integer().min(1).required() }),
    body: Joi.object({
      firstName: Joi.string().trim().alphanum().min(1)
        .max(100),
      lastName: Joi.string().trim().alphanum().min(1)
        .max(100),
      dob: Joi.date(),
      bio: Joi.string().alphanum().min(1).max(32000),
    }),
  },
};
export default authors;
