import Joi from 'joi';
import HttpError from 'http-errors';
import _ from 'lodash';

const validate = (schema) => (req, res, next) => {
  try {
    if (!_.isEmpty(req.body)) {
      console.log(req.body);
      // eslint-disable-next-line no-return-assign
      Object.entries(req.body).map((e) => req.body[e[0]] = e[1].trim());
    }
    // eslint-disable-next-line no-unused-vars
    const { value, error } = Joi.object(schema).unknown().validate(req, {
      abortEarly: false,
      label: 'key',
      convert: true,
      errors: { wrap: { label: '' } },
    });
    if (error) {
      const errorDetails = {};
      error.details?.forEach((d) => {
        errorDetails[`${d.context.key}`] = d.message.replace(`${d.context.label}`, `${d.context.key}`);
      });
      throw HttpError(422, { error: errorDetails });
    }
    next();
  } catch (er) {
    next(er);
  }
};
export default validate;
