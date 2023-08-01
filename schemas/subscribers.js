import Joi from 'joi';

const subscribers = {
  add: { body: Joi.object({ email: Joi.string().email().required() }) },
  list: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1),
      limit: Joi.number()
        .integer()
        .min(1)
        .max(20),
    }),
  },
};
export default subscribers;
