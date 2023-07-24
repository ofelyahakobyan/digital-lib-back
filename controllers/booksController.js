import HttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import sequelize from '../services/sequelize';
import { Books, Authors, Categories, Reviews, BookCategories, BookFiles } from '../models';

class BooksController {
  static list = async (req, res, next) => {
    try {
      let { page = 1, limit = 9 } = req.query;
      const {
        minPrice = 0,
        maxPrice = 9999999,
        rating,
        format = [],
        languages = [],
        authorIds = [],
        popular,
        brandNew,
        bestseller,
        q,
        categoryIds = [],
      } = req.query;
      const initialConditions = {
        status: 'available',
        price: {
          $and: {
            $gte: minPrice,
            $lte: maxPrice,
          },
        },
      };
      let itemsByCategories = [];
      const where = initialConditions;
      if (format.includes('text')) {
        where.audio = false;
      }
      if (format.includes('audio')) {
        where.audio = true;
      }
      if (format.includes('text') && format.includes('audio')) {
        where.audio = { $or: [true, false] };
      }
      // if (format[1] === 'audio') {
      //   where.audio = true;
      // }
      if (languages.length) {
        where.language = { $or: [languages] };
      }
      if (authorIds.length) {
        where.authorId = { $or: [authorIds] };
      }
      if (categoryIds.length) {
        const items = await BookCategories.findAll({
          where: { categoryId: { $or: [categoryIds] } },
          raw: true,
        });
        itemsByCategories = items.map((item) => item.bookId);
      }
      if (popular === '1') {
        where.popular = true;
      }
      if (brandNew === '1') {
        where.new = true;
      }
      if (bestseller === '1') {
        where.bestseller = true;
      }
      const mask = { $like: `%${q}%` };
      if (q) {
        // categoryId = '';
        // where = initialConditions;
        const cats = await Categories.findOne({ where: { category: { $like: `%${q}%` } } });
        if (cats && !categoryIds.length) {
          const items = await BookCategories.findAll({ where: { categoryId: cats.id }, raw: true });
          itemsByCategories = items.map((item) => item.bookId);
        }
        where.$or = [
          { title: mask },
          { description: mask },
          { language: mask },
          { '$author.firstName$': mask },
          { '$author.lastName$': mask },
        ];
      }
      if (itemsByCategories.length) {
        where.id = { $or: [itemsByCategories] };
      }
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Books.count({ where });
      const books = await Books.findAll({
        limit,
        offset,
        attributes: {
          exclude: [
            'status',
            'createdAt',
            'updatedAt',
            'description',
            'publisherId',
            'coverImage',
          ],
          include: [
            [
              sequelize.literal(
                '(select count(bookId) from reviews group by bookId having bookId=id)',
              ),
              'totalReviews',
            ],
            [
              sequelize.literal(
                '(select ceil(avg(rating)) as avg from reviews group by bookId having bookId=id )',
              ),
              'averageRating',
            ],
          ],
        },
        where,
        include: [
          {
            model: Authors,
            as: 'author',
            required: true,
            attributes: { exclude: ['bio', 'dob', 'createdAt', 'updatedAt'] },
          },
          {
            model: Categories,
            as: 'categories',
            where: categoryIds.length ? { id: { $or: [categoryIds] } } : { },
            required: !!categoryIds.length,
            through: { attributes: [] },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
          {
            model: Reviews,
            attributes: [],
            as: 'reviews',
            where: rating
              ? sequelize.where(sequelize.literal('(select ceil(avg(rating)) from reviews group by bookId having bookId=books.id )'), { $eq: rating })
              : {},
            required: !!rating,
          },
          {
            model: BookFiles,
            as: 'bookFiles',
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        books,
      });
    } catch (er) {
      next(er);
    }
  };

  // public
  static authorList = async (req, res, next) => {
    try {
      let { page = 1, limit = 4 } = req.query;
      const { authorId } = req.params;
      const where = { authorId };
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Books.count({ where });
      const books = await Books.findAll({
        limit,
        offset,
        where,
        attributes: {
          exclude: [
            'status',
            'createdAt',
            'updatedAt',
            'description',
            'publisherId',
            'coverImage',
          ],
          include: [
            [
              sequelize.literal(
                '(select count(bookId) from reviews group by bookId having bookId=id)',
              ),
              'totalReviews',
            ],
            [
              sequelize.literal(
                '(select ceil(avg(rating)) as avg from reviews group by bookId having bookId=id )',
              ),
              'averageRating',
            ],
          ],
        },
        include: [
          {
            model: Reviews,
            attributes: [],
            as: 'reviews',
          },
          {
            model: BookFiles,
            as: 'bookFiles',
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        books,
      });
    } catch (er) {
      next(er);
    }
  };

  // public
  static categoryList = async (req, res, next) => {
    try {
      let { page = 1, limit = 4 } = req.query;
      const { categoryId } = req.params;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Books.count({
        include:
      {
        model: Categories,
        as: 'categories',
        where: { id: categoryId },
        through: { attributes: [] },
      },
      });
      const books = await Books.findAll({
        limit,
        offset,
        attributes: {
          exclude: [
            'status',
            'createdAt',
            'updatedAt',
            'description',
            'publisherId',
            'coverImage',
          ],
          include: [
            [
              sequelize.literal(
                '(select count(bookId) from reviews group by bookId having bookId=id)',
              ),
              'totalReviews',
            ],
            [
              sequelize.literal(
                '(select ceil(avg(rating)) as avg from reviews group by bookId having bookId=id )',
              ),
              'averageRating',
            ],
          ],
        },
        include: [
          {
            model: Reviews,
            attributes: [],
            as: 'reviews',
          },
          {
            model: Authors,
            as: 'author',
            required: true,
            attributes: { exclude: ['bio', 'dob', 'createdAt', 'updatedAt'] },
          },
          {
            model: BookFiles,
            as: 'bookFiles',
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
          {
            model: Categories,
            as: 'categories',
            where: { id: categoryId },
            through: { attributes: [] },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
        ],
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        books,
      });
    } catch (er) {
      next(er);
    }
  };

  // public
  static single = async (req, res, next) => {
    try {
      const { bookId } = req.params;
      const book = await Books.findByPk(
        bookId,
        {
          include: [{ model: Authors, attributes: { exclude: ['bio', 'dob', 'createdAt', 'updatedAt'] } },
            { model: Reviews, attributes: [] }],
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'authorId', 'publisherId'],
            include: [
              [
                sequelize.literal(
                  '(select count(bookId) from reviews where bookId=id)',
                ),
                'totalReviews',
              ],
              [
                sequelize.literal(
                  '(select ceil(avg(rating)) from reviews where bookId=id)',
                ),
                'averageRating',

              ]],
          },
        },
      );
      if (!book) {
        throw HttpError(404);
      }
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        book,
      });
    } catch (er) {
      next(er);
    }
  };

  // TODO admin should be able to edit books
  // TODO here should  be book upload API
  // OFELYA'S VERSION

  static add = async (req, res, next) => {
    try {
      const {
        title,
        price,
        description = '',
        language,
        authorId,
        categories,
        brandNew = false,
        popular = false,
        bestseller = false,
      } = req.body;
      const { file } = req;
      let coverXS = '';
      let coverS = '';
      let coverM = '';
      let coverL = '';
      const bookData = {
        title,
        price,
        description,
        language,
        authorId,
        new: brandNew,
        popular,
        bestseller,
        audio: false,
        publisherId: null,
        status: 'unavailable',
        coverImage: coverM || 'default',
      };
      if (!categories || !categories[0] || !categories.length) {
        throw HttpError(400, 'at least one category should be provided');
      }
      // categories should be validated as an array from JOI
      const newBook = await Books.build(bookData);
      if (!newBook) {
        throw HttpError(400, 'unable to create book');
      }
      const existingCategories = await Categories.findAll({ where: { id: { $in: categories } } });
      if (!existingCategories.length) {
        throw HttpError(400, 'invalid categories are provided');
      }
      const bookAlreadyHasCategory = await BookCategories.findOne({
        where: {
          bookId: newBook.id,
          categoryId: { $in: categories },
        },
      });
      if (bookAlreadyHasCategory) {
        throw HttpError(422, 'book already has the provided category');
      }
      await newBook.save();
      if (file) {
        const name = file.originalname.split('.')[0];
        const fileName = `book-${uuidv4()}_${name}.jpg`;
        // multer resizer
        coverXS = path.join('images/covers', `extra-small-${fileName}`);
        coverS = path.join('images/covers', `small-${fileName}`);
        coverM = path.join('images/covers', `medium-${fileName}`);
        coverL = path.join('images/covers', `large-${fileName}`);
        const fullPath = path.join(path.resolve(), 'public', 'api/v1');
        await sharp(file.buffer)
          .resize({ width: 110 })
          .rotate()
          .jpeg({
            quality: 90,
            mozjpeg: true,
          })
          .toFile(`${fullPath}/${coverXS}`);

        await sharp(file.buffer)
          .resize({ width: 160 })
          .rotate()
          .jpeg({
            quality: 90,
            mozjpeg: true,
          })
          .toFile(`${fullPath}/${coverS}`);

        await sharp(file.buffer)
          .resize({ width: 285 })
          .rotate()
          .jpeg({
            quality: 90,
            mozjpeg: true,
          })
          .toFile(`${fullPath}/${coverM}`);

        await sharp(file.buffer)
          .resize({
            width: 387,
            fit: 'contain',
          })
          .rotate()
          .jpeg({
            quality: 90,
            mozjpeg: true,
          })
          .trim()
          .toFile(`${fullPath}/${coverL}`);

        await BookFiles.create({
          bookId: newBook.id,
          coverXS,
          coverS,
          coverM,
          coverL,
        });
      }

      await Promise.all(existingCategories.map(async (cat) => {
        await BookCategories.create({ bookId: newBook.id, categoryId: cat.id });
      }));
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        newBook,
      });
    } catch (er) {
      next(er);
    }
  };

  static addFiles = async (req, res, next) => {
    try {
      const { bookId } = req.params;
      let book = await BookFiles.findByPk(bookId);
      if (!book) {
        book = await BookFiles.build({ bookId });
      }
      const { files } = req;
      if (files.previewPDF) {
        book.previewPDF = path.join('/images/books', `${files.previewPDF[0].filename}`);
        fs.renameSync(files.previewPDF[0].path, path.join(path.resolve(), 'public', 'api/v1/images/books', `${files.previewPDF[0].filename}`));
      }
      if (files.fullPDF) {
        book.fullPDF = path.join('/images/books', `${files.fullPDF[0].filename}`);
        fs.renameSync(files.fullPDF[0].path, path.join(path.resolve(), 'public', 'api/v1/images/books', `${files.fullPDF[0].filename}`));
      }
      await book.save();

      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        book,
      });
    } catch (er) {
      next(er);
    }
  };
}

export default BooksController;
