import jwt from 'jsonwebtoken';
import HttpError from 'http-errors';

const { JWT_SECRET } = process.env;

const authorization = (type) => (req, res, next) => {
  try {
    const { authorization = '' } = req.headers;
    if (!authorization) {
      throw HttpError(401);
    }
    if (type === 'login') {
      const { userID } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET);
      if (!userID) {
        throw HttpError(401);
      }
      req.userID = userID;
      return next();
    }
    if (type === 'admin') {
      const { userID, isAdmin } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET);
      if (!userID || !isAdmin) {
        throw HttpError(403);
      }
      req.userID = userID;
      req.isAdmin = isAdmin;
      return next();
    }
    return next();
  } catch (er) {
    return next(er);
  }
};

export default authorization;
