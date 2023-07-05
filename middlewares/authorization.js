import jwt from 'jsonwebtoken';
import HttpError from 'http-errors';

const { JWT_SECRET, BASE_URL } = process.env;
const EXCLUDE = [
  `GET:${BASE_URL}`,
  `POST:${BASE_URL}/user/signup`,
  `POST:${BASE_URL}/user/login`,
  `POST:${BASE_URL}/user/forgot-password`,
  `POST:${BASE_URL}/user/reset-password`,
  `GET:${BASE_URL}/books`,
  `GET:${BASE_URL}/users`,
];

const authorization = (req, res, next) => {
  try {
    if (req.isAdmin) {
      return next();
    }
    const { path, method } = req;
    if (EXCLUDE.includes(`${method}:${path}`)) {
      return next();
    }
    const { authorization = '' } = req.headers;
    const { userID } = jwt.verify(authorization, JWT_SECRET);
    // jwt verification failed
    // customize error
    if (!userID) {
      throw HttpError(401);
    }
    req.userID = userID;
    return next();
  } catch (er) {
    return next(er);
  }
};

export default authorization;
