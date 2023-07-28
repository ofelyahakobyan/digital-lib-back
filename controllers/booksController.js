import HttpError from 'http-errors';
import path from 'path';
import fs from 'fs';
// import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import sequelize from '../services/sequelize';
import { Books, Authors, Categories, Reviews, BookCategories, BookFiles } from '../models';
import fileRemover from '../helpers/fileRemover';
import imageResizer from '../helpers/imageResizer';
import fileNameDefiner from '../helpers/fileNameDefiner';

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
        status: { $not: 'unavailable' },
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
      if (popular) {
        where.popular = true;
      }
      if (brandNew) {
        where.new = true;
      }
      if (bestseller) {
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
          include: [
            {
              model: Authors,
              as: 'author',
              attributes: { exclude: ['bio', 'dob', 'createdAt', 'updatedAt', 'coverImage'] },
            },
            { model: Reviews, as: 'reviews', attributes: [] },
            { model: BookFiles, as: 'bookFiles' },
          ],
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

  // separate worker
  static add = async (req, res, next) => {
    let t = null;
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
      const { files } = req;
      const bookFilesData = {};
      console.log(files);
      const existingCategories = await Categories.findAll({ where: { id: { $in: [categories] } } });
      if (!existingCategories.length) {
        throw HttpError(400, 'invalid categories are provided');
      }
      const author = await Authors.findByPk(authorId);
      if (!author) {
        throw HttpError(404, 'author with the provided id does not exist ');
      }

      if (files.cover) {
        const fileName = fileNameDefiner(files.cover[0], title, 'cover');
        const fullPath = path.join(path.resolve(), 'public/images/covers');
        await imageResizer(files.cover[0].path, { width: 110 }, `${fullPath}/XS-${fileName}`);
        await imageResizer(files.cover[0].path, { width: 160 }, `${fullPath}/S-${fileName}`);
        await imageResizer(files.cover[0].path, { width: 285 }, `${fullPath}/M-${fileName}`);
        await imageResizer(files.cover[0].path, { width: 387, fit: 'contain' }, `${fullPath}/L-${fileName}`);

        bookFilesData.coverXS = `images/covers/XS-${fileName}`;
        bookFilesData.coverS = `images/covers/S-${fileName}`;
        bookFilesData.coverM = `images/covers/M-${fileName}`;
        bookFilesData.coverL = `images/covers/L-${fileName}`;
      }
      if (files.preview) {
        const fileName = fileNameDefiner(files.preview[0], title, 'preview');
        const newPath = path.join(path.resolve(), 'public/books/previews', fileName);
        fs.renameSync(files.preview[0].path, newPath);
        bookFilesData.previewPDF = `books/previews/${fileName}`;
      }
      if (files.full) {
        const fileName = fileNameDefiner(files.full[0], title, 'full');
        const newPath = path.join(path.resolve(), 'public/books/fulls', fileName);
        fs.renameSync(files.full[0].path, newPath);
        bookFilesData.fullPDF = `books/fulls/${fileName}`;
      }
      if (files.audio) {
        const fileName = fileNameDefiner(files.audio[0], title, 'audio');
        const newPath = path.join(path.resolve(), 'public/books/audios', fileName);
        fs.renameSync(files.audio[0].path, newPath);
        bookFilesData.audio = `books/audios/${fileName}`;
      }
      // transaction start
      t = await sequelize.transaction();
      // if  full or audio files exist, job should be done on the separate proccess
      const newBook = await Books.create({
        title,
        price,
        description,
        language,
        authorId,
        new: brandNew,
        popular,
        bestseller,
        status: 'unavailable',
        audio: false,
        coverImage: '',
        publisherId: null,
      }, { transaction: t });
      if (!newBook) {
        throw HttpError(400, 'unable to create book');
      }
      await Promise.all(existingCategories.map(async (cat) => {
        await BookCategories.create({ bookId: newBook.id, categoryId: cat.id }, { transaction: t });
      }));
      await BookFiles.create({ ...bookFilesData, bookId: newBook.id }, { transaction: t });
      if (files.full) {
        newBook.status = 'available';
      } else {
        newBook.status = 'upcoming';
      }
      if (files.audio) {
        newBook.audio = true;
      }
      await newBook.save({ transaction: t });
      // transaction end
      if (t) {
        await t.commit();
      }
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        newBook,
      });
    } catch (er) {
      if (t) {
        await t.rollback();
      }
      next(er);
    }
  };

  // separate worker
  static edit = async (req, res, next) => {
    let t = null;
    try {
      const { bookId } = req.params;
      const { files } = req;

      const book = await Books.findByPk(bookId);
      if (!book) {
        throw HttpError(404, 'book was not found');
      }
      const {
        title,
        price,
        description,
        language,
        authorId,
        categories,
        brandNew,
        popular,
        bestseller,
      } = req.body;

      // previews files that should be deleted
      let previewsCoverXS = '';
      let previewsCoverS = '';
      let previewsCoverM = '';
      let previewsCoverL = '';
      let previewsPreview = '';
      let previewsFull = '';
      let previewsAudio = '';
      let existingCategories = [];

      if (categories) {
        existingCategories = await Categories.findAll(
          { where: { id: { $in: [categories] } } },
        );
        if (!existingCategories.length) {
          throw HttpError(400, 'invalid categories are provided');
        }
      }
      if (authorId) {
        const author = await Authors.findByPk(authorId);
        if (!author) {
          throw HttpError(404, 'author with the provided id does not exist ');
        }
      }

      book.title = title || book.title;
      book.price = price || book.price;
      book.description = description || book.description;
      book.language = language || book.language;
      book.authorId = authorId || book.authorId;
      book.brandNew = brandNew || book.brandNew;
      book.popular = popular || book.popular;
      book.bestseller = bestseller || book.bestseller;

      // transaction start
      t = await sequelize.transaction();
      let bookFiles = await BookFiles.findOne({ where: { bookId } }, { transaction: t });
      if (!bookFiles) {
        bookFiles = await BookFiles.create({ bookId }, { transaction: t });
      }
      if (files) {
        if (files.cover) {
          if (bookFiles.coverXS) {
            previewsCoverXS = path.join(path.resolve(), 'public', `${bookFiles.coverXS}`);
          }
          if (bookFiles.coverS) {
            previewsCoverS = path.join(path.resolve(), 'public', `${bookFiles.coverS}`);
          }
          if (bookFiles.coverM) {
            previewsCoverM = path.join(path.resolve(), 'public', `${bookFiles.coverM}`);
          }
          if (bookFiles.coverL) {
            previewsCoverL = path.join(path.resolve(), 'public', `${bookFiles.coverL}`);
          }
          const fileName = fileNameDefiner(files.cover[0], book.title, 'cover');
          // multer resizer
          const fullPath = path.join(path.resolve(), 'public/images/covers');

          await imageResizer(files.cover[0].path, { width: 110 }, `${fullPath}/XS-${fileName}`);
          await imageResizer(files.cover[0].path, { width: 160 }, `${fullPath}/S-${fileName}`);
          await imageResizer(files.cover[0].path, { width: 285 }, `${fullPath}/S-${fileName}`);
          await imageResizer(files.cover[0].path, { width: 387, fit: 'contain' }, `${fullPath}/S-${fileName}`);

          bookFiles.coverXS = `images/covers/XS-${fileName}`;
          bookFiles.coverS = `images/covers/S-${fileName}`;
          bookFiles.coverM = `images/covers/M-${fileName}`;
          bookFiles.coverL = `images/covers/L-${fileName}`;
        }
        if (files.preview) {
          if (bookFiles.preview) {
            previewsPreview = path.join(path.resolve(), 'public', `${bookFiles.preview}`);
          }
          const fileName = fileNameDefiner(files.preview[0], book.title, 'preview');
          const newPath = path.join(path.resolve(), 'public/books/previews', fileName);
          fs.renameSync(files.preview[0].path, newPath);
          bookFiles.previewPDF = `books/previews/${fileName}`;
        }
        if (files.full) {
          book.status = 'available';
          if (bookFiles.full) {
            previewsFull = path.join(path.resolve(), 'public', `${bookFiles.full}`);
          }
          const fileName = fileNameDefiner(files.full[0], book.title, 'full');
          const newPath = path.join(path.resolve(), 'public/books/fulls', fileName);
          fs.renameSync(files.full[0].path, newPath);
          bookFiles.fullPDF = `books/fulls/${fileName}`;
        }
        if (files.audio) {
          book.status = 'upcoming';
          if (bookFiles.audio) {
            previewsAudio = path.join(path.resolve(), 'public', `${bookFiles.audio}`);
          }
          const fileName = fileNameDefiner(files.audio[0], book.title, 'audio');
          const newPath = path.join(path.resolve(), 'public/books/audios', fileName);
          fs.renameSync(files.audio[0].path, newPath);
          bookFiles.audio = `books/audios/${fileName}`;
        }
      }

      await Promise.all(existingCategories.map(async (cat) => {
        const bookCategory = await BookCategories
          .findOne({ where: { bookId: book.id, categoryId: cat.id } }, { transaction: t });
        if (!bookCategory) {
          await BookCategories.create(
            { bookId: book.id, categoryId: cat.id },
            { transaction: t },
          );
        }
      }));
      await bookFiles.save({ transaction: t });
      await book.save({ transaction: t });
      fileRemover(previewsCoverXS);
      fileRemover(previewsCoverS);
      fileRemover(previewsCoverM);
      fileRemover(previewsCoverL);
      fileRemover(previewsPreview);
      fileRemover(previewsFull);
      fileRemover(previewsAudio);
      if (t) {
        await t.commit();
      }
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        book,
      });
    } catch (er) {
      if (t) {
        await t.rollback();
      }
      next(er);
    }
  };
}

export default BooksController;
