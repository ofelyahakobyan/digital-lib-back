import Joi from 'joi';

const orders = {
  checkoutSession: {
    body: Joi.object(
      // { books: Joi.array().items(Joi.number().integer().min(1)).required() },
      { bookId: Joi.number().integer().min(1).required() },
    ),
  },
};
export default orders;
