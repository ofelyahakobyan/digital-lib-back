import Joi from 'joi';

const contacts = {
  add: {
    body: Joi.object({
      firstName: Joi.string().alphanum().min(3).required(),
      lastName: Joi.string().alphanum().min(3),
      email: Joi.string().email().required(),
      message: Joi.string().required(),
    }),
  },
};
export default contacts;
