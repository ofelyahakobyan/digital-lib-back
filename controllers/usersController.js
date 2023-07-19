import HttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { v4 as uuidV4 } from 'uuid';
import hash from '../helpers/hash';
import { Users } from '../models';
import Mail from '../services/mail';

const { JWT_SECRET } = process.env;

class UsersController {
  // admin role is required
  static list = async (req, res, next) => {
    try {
      const { userID, isAdmin } = req;

      const user = await Users.findOne({ where: { id: userID, isAdmin } });
      if (!user || !user.isAdmin) {
        throw HttpError(401);
      }
      let { page = 1, limit = 20 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Users.count();
      const users = await Users.findAll({
        limit,
        offset,
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        data: { users },
      });
    } catch (er) {
      next(er);
    }
  };

  // public
  static registration = async (req, res, next) => {
    try {
      const { firstName, lastName = '', email, password } = req.body;
      const existingUser = await Users.findOne({
        attributes: ['id'],
        where: { email },
      });
      if (existingUser) {
        throw HttpError(409, { error: { email: 'already registered' } });
      }
      const user = await Users.create({
        firstName,
        email,
        lastName,
        password,
      });
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        message: 'new user was successfully registered',
        user,
      });
    } catch (er) {
      next(er);
    }
  };

  // public
  static login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({
        where: {
          email,
          password: hash(password),
        },
      });
      if (!user) {
        throw HttpError(404, 'incorrect username or password');
      }
      const token = jwt.sign(
        { userID: user.id, isAdmin: user.isAdmin },
        JWT_SECRET,
      );

      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        message: 'user successfully logged in',
        token,
        user,
      });
    } catch (er) {
      next(er);
    }
  };

  // logged  user role is required
  static getProfile = async (req, res, next) => {
    try {
      const { userID } = req;
      const user = await Users.findByPk(userID, { attributes: { exclude: ['password', 'isAdmin', 'isBlocked'] } });
      if (!user) {
        throw HttpError(422);
      }
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        user,
      });
    } catch (er) {
      next(er);
    }
  };

  // logged  user role is required
  static editProfile = async (req, res, next) => {
    try {
      const { userID } = req;
      const {
        firstName,
        lastName,
        email,
        phone,
        nikName,
        country,
        dob,
        shortAbout,
      } = req.body;
      const user = await Users.findByPk(userID);
      if (!user) {
        throw HttpError(422);
      }
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.phone = phone || user.phone;
      user.nikName = nikName || user.nikName;
      user.country = country || user.country;
      user.dob = dob || user.dob;
      user.shortAbout = shortAbout || user.shortAbout;
      await user.save();
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        user,
      });
    } catch (er) {
      next(er);
    }
  };

  // logged  user role is required
  static forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        throw HttpError(
          404,
          'user with provided email address does not exists',
        );
      }
      const verificationCode = uuidV4();
      user.verificationCode = verificationCode;
      await user.save();
      Mail.send(email, 'Reset Password', 'resetPassword', {
        email,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationCode,
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        message: 'email with verification link is send to the client email',
      });
    } catch (er) {
      next(er);
    }
  };

  // logged  user role is required
  static resetPassword = async (req, res, next) => {
    try {
      const { code, email, newPassword } = req.body;
      if (!code || !email) {
        throw HttpError(400);
      }
      const user = await Users.findOne({
        where: {
          email,
          verificationCode: code,
        },
      });
      if (!user) {
        throw HttpError(403, 'provided  verification code is invalid');
      }
      user.password = newPassword;
      user.verificationCode = '';
      await user.save();
      res.status(201).json({
        code: res.status,
        status: 'success',
        message: 'password successfully changed',
        user,
      });
    } catch (er) {
      next(er);
    }
  };

  // logged  user role is required
  static changePassword = async (req, res, next) => {
    try {
      const { userID } = req;
      const { currentPassword, newPassword } = req.body;
      if (!userID) {
        throw HttpError(401);
      }
      if (!currentPassword || !newPassword) {
        throw HttpError(400);
      }
      const user = await Users.findOne({
        where: {
          id: userID,
          password: hash(currentPassword),
        },
      });

      if (!user) {
        throw HttpError(404, 'user is not registered');
      }
      user.password = newPassword;
      await user.save();
      res.status(201).json({
        code: res.status,
        status: 'success',
        message: 'password successfully changed',
        user,
      });
    } catch (er) {
      next(er);
    }
  };
}

export default UsersController;
