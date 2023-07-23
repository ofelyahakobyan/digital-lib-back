import HttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import hash from '../helpers/hash';
import { Users } from '../models';
import Mail from '../services/mail';

const { JWT_SECRET } = process.env;

class UsersController {
  // admin role is required
  static list = async (req, res, next) => {
    try {
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
      const existingUser = await Users.findOne({ where: { email } });
      if (existingUser) {
        throw HttpError(409, 'user with this email already registered');
      }
      const user = await Users.create({
        firstName,
        email,
        lastName,
        password,
      });
      const newUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        registrationDate: user.createdAt,
      };
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        message: 'new user was successfully registered',
        user: newUser,
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
        throw HttpError(404, 'invalid username or password');
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

  // logged-in  user role is required
  static getProfile = async (req, res, next) => {
    try {
      const { userID } = req;
      const user = await Users.findByPk(userID, { attributes: { exclude: ['password', 'isAdmin', 'isBlocked'] } });
      if (!user) {
        throw HttpError(404, 'the provided userId is invalid');
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

  // logged-in  user role is required
  static editProfile = async (req, res, next) => {
    try {
      const { userID } = req;
      const user = await Users.findByPk(userID, { attributes: { exclude: ['isAdmin', 'isBlocked'] } });
      if (!user) {
        throw HttpError(404, 'the provided userId is invalid');
      }
      const {
        firstName,
        lastName,
        phone,
        nikName,
        country,
        dob,
        shortAbout,
      } = req.body;
      const { file } = req;
      let avatar = '';
      if (file) {
        if (user.avatar) {
          const filePath = path.join(path.resolve(), 'public/api/v1/', `${user.avatar}`);
          setImmediate(() => {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
        }
        const name = file.originalname.split('.')[0];
        const fileName = `user-${userID}-${uuidv4()}_${name}.jpg`;
        // multer resizer
        avatar = path.join('images/users', fileName);
        const fullPath = path.join(path.resolve(), 'public', 'api/v1', avatar);
        await sharp(file.buffer).resize(86, 86).rotate().jpeg({ quality: 90, mozjpeg: true })
          .toFile(fullPath);
      }
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.phone = phone || user.phone;
      user.nikName = nikName || user.nikName;
      user.country = country || user.country;
      user.dob = dob || user.dob;
      user.shortAbout = shortAbout || user.shortAbout;
      user.avatar = avatar || user.avatar;
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

  // public
  static forgotPassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        throw HttpError(404, 'user with provided email does not exist');
      }
      const verificationCode = uuidv4();
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

  // public
  static resetPassword = async (req, res, next) => {
    try {
      const { code, email, newPassword } = req.body;
      if (!code) {
        throw HttpError(400);
      }
      const user = await Users.findOne({
        where: {
          email,
          verificationCode: code,
        },
        attributes: { exclude: ['isBlocked', 'isAdmin'] },
      });
      if (!user) {
        throw HttpError(404, 'User is not found or invalid verification code.');
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

  // logged-in  user role is required
  static changePassword = async (req, res, next) => {
    try {
      const { userID } = req;
      const { currentPassword, newPassword } = req.body;
      const user = await Users.findOne({
        where: {
          id: userID,
          password: hash(currentPassword),
        },
        attributes: { exclude: ['isBlocked', 'isAdmin'] },
      });
      if (!user) {
        throw HttpError(401, 'user is not registered');
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
