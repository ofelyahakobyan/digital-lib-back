import jwt from 'jsonwebtoken';
import HttpError from 'http-errors';

const { JWT_SECRET, BASE_URL } = process.env;
const EXCLUDE = [
  // all routes where admin authentification is not required
  `GET:${BASE_URL}`,
  `POST:${BASE_URL}/user/signup`,
  `POST:${BASE_URL}/user/login`,
  `POST:${BASE_URL}/user/forgot-password`,
  `POST:${BASE_URL}/user/reset-password`,
];

const authorization = (req, res, next) => {
  try {
    const { path, method } = req;
    if (EXCLUDE.includes(`${method}:${path}`)) {
      return next();
    }
    const { authorization = '' } = req.headers;
    const { userID, isAdmin } = jwt.verify(authorization, JWT_SECRET);
    if (!userID || !isAdmin) {
      throw HttpError(403, 'invalid admin token');
    }
    req.userID = userID;
    req.isAdmin = isAdmin;
    return next();
  } catch (er) {
    return next(er);
  }
};

export default authorization;
