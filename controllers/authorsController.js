import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import HttpError from 'http-errors';
import { Authors } from '../models';

class authorsController {
  // public
  static list = async (req, res, next) => {
    try {
      let { page = 1, limit = 4 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Authors.count();
      const authors = await Authors.findAll({
        limit,
        offset,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        authors,
      });
    } catch (er) {
      next(er);
    }
  };

  // admin role is required
  static create = async (req, res, next) => {
    try {
      const { firstName, lastName = null, bio = null, dob = null } = req.body;
      if (!firstName) {
        throw HttpError(403);
      }
      const { file } = req;
      let avatar = '';
      if (file) {
        const ext = file.mimetype.split('/')[1];
        const name = file.originalname.split('.')[0];
        const fileName = `author-${uuidv4()}_${name}.${ext}`;
        avatar = path.join('images/authors', fileName);
        const fullPath = path.join(path.resolve(), 'public', 'api/v1', avatar);
        fs.writeFileSync(fullPath, file.buffer);
      }
      // JOI validation
      const author = await Authors.create({ firstName, lastName, bio, dob, avatar });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        message: 'new author successfully added',
        author,
      });
    } catch (er) {
      next(er);
    }
  };

  // admin role is required (author id is required)
  static edit = async (req, res, next) => {
    try {
      const {
        firstName,
        lastName,
        bio,
        dob,
      } = req.body;
      const { file } = req;
      const { authorId } = req.params;
      const author = await Authors.findByPk(authorId);
      if (!author) {
        throw HttpError(422);
      }

      let newAvatar = '';
      if (file) {
        const ext = file.mimetype.split('/')[1];
        const name = file.originalname.split('.')[0];
        const fileName = `author-${uuidv4()}_${name}.${ext}`;
        newAvatar = path.join('images/authors', fileName);
        const fullPath = path.join(path.resolve(), 'public', 'api/v1', newAvatar);
        fs.writeFileSync(fullPath, file.buffer);
      }
      author.firstName = firstName || author.firstName;
      author.lastName = lastName || author.lastName;
      author.bio = bio || author.bio;
      author.dob = dob || author.dob;
      author.avatar = newAvatar || author.avatar;
      await author.save();
      res.status(201)
        .json({
          code: res.statusCode,
          status: 'success',
          author,
        });
    } catch (er) {
      next(er);
    }
  };
}

export default authorsController;
