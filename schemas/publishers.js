import Joi from 'joi';

const publishers = {
  body: Joi.object({
    companyName: Joi.string().required(),
    country: Joi.string(),
  }),
};
export default publishers;
