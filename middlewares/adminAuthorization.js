import jwt from 'jsonwebtoken';
import HttpError from 'http-errors';

const { JWT_SECRET, BASE_URL } = process.env;
const EXCLUDE = [
  // logged-in user routes
  `GET:${BASE_URL}/user/profile`,
  `PATCH:${BASE_URL}/user/profile`,
  `GET:${BASE_URL}/user/wishlist`,
  `GET:${BASE_URL}/user/cart`,
  `GET:${BASE_URL}/books`,
  `GET:${BASE_URL}/books/search`,
  `GET:${BASE_URL}/user/login-facebook`,
  `GET:${BASE_URL}/user/facebook`,
  `GET:${BASE_URL}/user/reviews`,
  `GET:${BASE_URL}/categories`,
  `GET:${BASE_URL}/authors`,
  `DELETE:${BASE_URL}/user/profile`,
];

const EXCLUDE_VAR = [
  `GET:${BASE_URL}/books`,
  `POST:${BASE_URL}/user/reviews`,
  `PATCH:${BASE_URL}/user/reviews`,
  `POST:${BASE_URL}/user/wishlist`,
  `DELETE:${BASE_URL}/user/wishlist`,
  `POST:${BASE_URL}/user/cart`,
  `DELETE:${BASE_URL}/user/cart`,
  `POST:${BASE_URL}/user/password`,
  `GET:${BASE_URL}/authors/single`,
  'GET:/images',
  `GET:/${BASE_URL}/images`,

];
const authorization = (req, res, next) => {
  try {
    const { path, method } = req;
    if (req.public) {
      return next();
    }
    for (let i = 0; i < EXCLUDE_VAR.length; i += 1) {
      if (`${method}:${path}`.startsWith(EXCLUDE_VAR[i])) {
        return next();
      }
    }
    if (EXCLUDE.includes(`${method}:${path}`)) {
      return next();
    }
    const { authorization = '' } = req.headers;
    if (!authorization) {
      throw HttpError(401);
    }
    const { userID, isAdmin } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET);
    if (!userID || !isAdmin) {
      throw HttpError(403);
    }
    req.userID = userID;
    req.isAdmin = isAdmin;
    return next();
  } catch (er) {
    return next(er);
  }
};

export default authorization;
