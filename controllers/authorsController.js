import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import HttpError from 'http-errors';
import sharp from 'sharp';
import fs from 'fs';
import { Authors, Books } from '../models';
import sequelize from '../services/sequelize';

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
        include: [
          {
            model: Books,
            as: 'books',
            attributes: [],
          },
        ],
        limit,
        offset,
        attributes: {
          include: [[
            sequelize.literal(
              '(select count(*) from books group by authorId having authorId=id)',
            ),
            'totalBooks',
          ]],
          exclude: ['createdAt', 'updatedAt'],
        },
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

  // public
  static single = async (req, res, next) => {
    try {
      const { authorId } = req.params;
      const author = await Authors.findByPk(authorId, {
        include: [
          {
            model: Books,
            as: 'books',
            attributes: [],
          },
        ],
        attributes: {
          include: [[
            sequelize.literal(
              '(select count(*) from books group by authorId having authorId=id)',
            ),
            'totalBooks',
          ]],
        },
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        author,
      });
    } catch (er) {
      next(er);
    }
  };

  // admin role is required
  static add = async (req, res, next) => {
    try {
      const { firstName, lastName = null, bio = null, dob = null } = req.body;
      const { file } = req;
      let avatar = '';
      let avatarSmall = '';
      if (file) {
        const name = file.originalname.split('.')[0];
        const fileName = `author-${firstName}-${uuidv4()}_${name}.jpg`;
        // multer resizer
        avatar = path.join('images/authors', fileName);
        avatarSmall = path.join('images/authors', `small-${fileName}`);
        const fullPath = path.join(path.resolve(), 'public', 'api/v1', avatar);
        const fullPathSmall = path.join(path.resolve(), 'public', 'api/v1', avatarSmall);
        await sharp(file.buffer).resize({
          width: 285,
          height: 425,
          fit: 'contain',
        }).rotate().jpeg({ quality: 90, mozjpeg: true })
          .toFile(fullPath);
        await sharp(file.buffer).resize(285, 390).rotate().jpeg({ quality: 90, mozjpeg: true })
          .toFile(fullPathSmall);
        // fs.writeFileSync(fullPath, file.buffer);
      }
      const author = await Authors.create({ firstName, lastName, bio, dob, avatar, avatarSmall });
      if (!author) {
        throw HttpError(400, 'unable to add new author');
      }
      res.status(201).json({
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
        throw HttpError(404, 'author with provided id not found');
      }
      let avatar = '';
      let avatarSmall = '';
      if (file) {
        if (author.avatar) {
          const filePath = path.join(path.resolve(), 'public/api/v1/', `${author.avatar}`);
          const smallFilePath = path.join(path.resolve(), 'public/api/v1/', `${author.avatarSmall}`);
          setImmediate(() => {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            if (fs.existsSync(smallFilePath)) {
              fs.unlinkSync(smallFilePath);
            }
          });
        }
        const name = file.originalname.split('.')[0];
        const fileName = `author-${author.firstName}-${uuidv4()}_${name}.jpg`;
        avatar = path.join('images/authors', fileName);
        avatarSmall = path.join('images/authors', `small-${fileName}`);
        const fullPath = path.join(path.resolve(), 'public', 'api/v1', avatar);
        const fullPathSmall = path.join(path.resolve(), 'public', 'api/v1', avatarSmall);
        await sharp(file.buffer).resize({
          width: 285,
          height: 425,
          fit: 'contain',
        }).rotate().jpeg({ quality: 90, mozjpeg: true })
          .toFile(fullPath);
        await sharp(file.buffer).resize(285, 390).rotate().jpeg({ quality: 90, mozjpeg: true })
          .toFile(fullPathSmall);
      }
      author.firstName = firstName || author.firstName;
      author.lastName = lastName || author.lastName;
      author.bio = bio || author.bio;
      author.dob = dob || author.dob;
      author.avatar = avatar || author.avatar;
      author.avatarSmall = avatarSmall || author.avatarSmall;
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
