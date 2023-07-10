import Joi from 'joi';
import HttpError from 'http-errors';

const validate = (schema) => (req, res, next) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { value, error } = Joi.object(schema).unknown().validate(req, {
      abortEarly: false,
      label: 'key',
      errors: { wrap: { label: '' } },
    });
    if (error) {
      const errorDetails = {};
      error.details?.forEach((d) => {
        errorDetails[`${d.context.key}`] = d.message;
      });
      throw HttpError(422, { error: errorDetails });
    }
    next();
  } catch (er) {
    next(er);
  }
};
export default validate;
