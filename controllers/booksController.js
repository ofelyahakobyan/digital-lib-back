import HttpError from 'http-errors';
import path from 'path';
import fs from 'fs';
import { Worker, isMainThread } from 'node:worker_threads';
import jwt from 'jsonwebtoken';
import sequelize from '../services/sequelize';
import {
  Books,
  Authors,
  Categories,
  Reviews,
  BookCategories,
  BookFiles,
  UserBooks,
  Downloads,
  Orders
} from '../models';
import fileRemover from '../helpers/fileRemover';
import fileNameDefiner from '../helpers/fileNameDefiner';

const { JWT_SECRET } = process.env;

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
        // eslint-disable-next-line no-unused-vars
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
        let itemsByCategories = [];
        const cats = await Categories.findOne(
          {
            raw: true,
            where:
              { category: { $like: `%${q}%` } },
          },
        );
        if (cats && !categoryIds.length) {
          const items = await BookCategories.findAll({ where: { categoryId: cats.id }, raw: true });
          itemsByCategories = items.map((item) => item.bookId);
        }
        where.$or = [
          { title: mask },
          { description: mask },
          { language: mask },
          { id: { $in: itemsByCategories } },
          { '$author.firstName$': mask },
          { '$author.lastName$': mask },
        ];
      }

      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;

      const books = await Books.findAll({
        subQuery: false,
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'publisherId',
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
            model: Authors,
            as: 'author',
            attributes: { exclude: ['bio', 'dob', 'createdAt', 'updatedAt'], include: ['firstName'] },
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
        where,
        limit,
        offset,
      });
      const total = await Books.count({
        include: [
          {
            model: Authors,
            as: 'author',
            required: true,
            attributes: { exclude: ['bio', 'dob', 'createdAt', 'updatedAt'], include: ['firstName'] },
          },
        ],
        where,
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
      const total = await Books.count(
        {
          include:
            {
              model: Categories,
              as: 'categories',
              where: { id: categoryId },
              through: { attributes: [] },
            },
        },
      );
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

  //  admin
  //  separate worker
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
      const workerFilesData = {};

      if (files.cover && files.cover[0].size > 5 * 1024 * 1024) {
        throw HttpError(413, 'cover image is too large');
      }
      if (files.preview && files.preview[0] > 25 * 1024 * 1024) {
        throw HttpError(413, 'preview pdf file is too large');
      }

      const existingCategories = await Categories.findAll({ where: { id: { $or: [categories] } } });
      if (!existingCategories.length) {
        throw HttpError(400, 'invalid categories are provided');
      }
      const author = await Authors.findByPk(authorId);
      if (!author) {
        throw HttpError(404, 'author with the provided id does not exist ');
      }

      // transaction start
      t = await sequelize.transaction();
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
        publisherId: null,
      }, { transaction: t });
      if (!newBook) {
        throw HttpError(400, 'unable to create book');
      }
      await Promise.all(existingCategories.map(async (cat) => {
        await BookCategories.create({ bookId: newBook.id, categoryId: cat.id }, { transaction: t });
      }));

      if (files.cover) {
        const fileName = fileNameDefiner(files.cover[0], title, 'cover');
        bookFilesData.coverXS = `images/covers/XS-${fileName}`;
        bookFilesData.coverS = `images/covers/S-${fileName}`;
        bookFilesData.coverM = `images/covers/M-${fileName}`;
        bookFilesData.coverL = `images/covers/L-${fileName}`;

        workerFilesData.cover = fileName;
      }
      if (files.preview) {
        const fileName = fileNameDefiner(files.preview[0], title, 'preview');
        bookFilesData.previewPDF = `books/previews/${fileName}`;
        workerFilesData.preview = fileName;
      }
      if (files.full) {
        newBook.status = 'available';
        const fileName = fileNameDefiner(files.full[0], title, 'full');
        bookFilesData.fullPDF = `books/fulls/${fileName}`;
        workerFilesData.full = fileName;
      } else {
        newBook.status = 'upcoming';
      }
      if (files.audio) {
        newBook.audio = true;
        const fileName = fileNameDefiner(files.audio[0], title, 'audio');
        bookFilesData.audio = `books/audios/${fileName}`;
        workerFilesData.audio = fileName;
      }

      if (isMainThread) {
        const workerFile = path.join(path.resolve(), '/services/bookUploadWorker.js');
        const worker = new Worker(workerFile, {
          workerData: {
            files,
            title,
            workerFilesData,
          },
        });
        worker.on('message', (msg) => {
          if (msg.error) {
            console.log(msg.message);
            // here should be logic for the case an error has happened in the worker file
          }
        });
      }
      await BookFiles.create({ ...bookFilesData, bookId: newBook.id }, { transaction: t });
      await newBook.save({ transaction: t });
      // transaction end
      if (t) {
        await t.commit();
      }
      // worker from here
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

  // admin
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
          { where: { id: { $or: [categories] } } },
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
      // worker take the bookFiles and files
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
          // image resizing
          if (isMainThread) {
            const workerFile = path.join(path.resolve(), '/services/bookEditWorker.js');
            const worker = new Worker(workerFile, {
              workerData: {
                files,
                fileName,
              },
            });
            worker.on('message', (msg) => {
              if (msg.error) {
                console.log(msg.message);
                // here should be logic for the case an error has happened in the worker file
              }
            });
          }
          bookFiles.coverXS = `images/covers/XS-${fileName}`;
          bookFiles.coverS = `images/covers/S-${fileName}`;
          bookFiles.coverM = `images/covers/M-${fileName}`;
          bookFiles.coverL = `images/covers/L-${fileName}`;
        }
        if (files.preview) {
          if (bookFiles.previewPDF) {
            previewsPreview = path.join(path.resolve(), 'public', `${bookFiles.previewPDF}`);
          }
          const fileName = fileNameDefiner(files.preview[0], book.title, 'preview');
          const newPath = path.join(path.resolve(), 'public/books/previews', fileName);
          fs.renameSync(files.preview[0].path, newPath);
          bookFiles.previewPDF = `books/previews/${fileName}`;
        }
        if (files.full) {
          book.status = 'available';
          if (bookFiles.fullPDF) {
            previewsFull = path.join(path.resolve(), 'public', `${bookFiles.fullPDF}`);
          }
          const fileName = fileNameDefiner(files.full[0], book.title, 'full');
          const newPath = path.join(path.resolve(), 'public/books/fulls', fileName);
          fs.renameSync(files.full[0].path, newPath);
          bookFiles.fullPDF = `books/fulls/${fileName}`;
        }
        if (files.audio) {
          book.status = 'upcoming';
          book.audio = 'true';
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

  // admin
  static delete = async (req, res, next) => {
    try {
      const { bookId } = req.params;
      const book = await Books.findByPk(bookId);
      if (!book) {
        throw HttpError(404, 'book with the provided Id does not exist');
      }
      const bookFiles = await BookFiles.findOne({ where: { bookId: book.id } });
      if (bookFiles) {
        const filePath = path.join(path.resolve(), 'public');
        fileRemover(`${filePath}/${bookFiles.coverXS}`);
        fileRemover(`${filePath}/${bookFiles.coverS}`);
        fileRemover(`${filePath}/${bookFiles.coverM}`);
        fileRemover(`${filePath}/${bookFiles.coverL}`);
        fileRemover(`${filePath}/${bookFiles.fullPDF}`);
        fileRemover(`${filePath}/${bookFiles.previewPDF}`);
        fileRemover(`${filePath}/${bookFiles.audio}`);
      }
      await book.destroy();
      res.status(204).json(
        { status: 'success' },
      );
    } catch (er) {
      next(er);
    }
  };

  // public
  static preview = async (req, res, next) => {
    try {
      const { bookId } = req.params;
      const book = await Books.findByPk(bookId);
      const bookFiles = await BookFiles.findOne({ where: { bookId } });
      if (!book || !bookFiles || !bookFiles.previewPDF) {
        throw HttpError(404, 'book preview file was not found');
      }

      const file = path.join(path.resolve(), 'public', bookFiles.previewPDF);
      if (!fs.existsSync(file)) {
        throw HttpError(404, 'book preview file was not found');
      }
      const stat = fs.statSync(file);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${book.title}.pdf`);
      res.sendFile(file);
    } catch (er) {
      next(er);
    }
  };

  static full = async (req, res, next) => {
    try {
      const { userID } = req;
      const { bookId } = req.params;
      const book = await Books.findByPk(bookId);
      const bookFiles = await BookFiles.findOne({ where: { bookId } });
      if (!book || !bookFiles.fullPDF) {
        throw HttpError(404, 'book was not found');
      }
      // THIS PART OF CODE SHOULD BE IMPLEMENTED WHEN APP USERS HAVE PAID FOR AUDIO BOOK
      const userBook = await UserBooks.findOne({ where: { bookId, status: 'paid' } });
      if (!userBook) {
        throw HttpError(402, 'payment is required');
      }
      const file = path.join(path.resolve(), 'public', bookFiles.fullPDF);
      const stat = fs.statSync(file);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${book.title}.pdf`);
      const fileStream = fs.createReadStream(file);
      fileStream.on('error', (er) => {
        next(er);
      });
      fileStream.pipe(res);
    } catch (er) {
      next(er);
    }
  };

  static audio = async (req, res, next) => {
    try {
      const { userID } = req;
      const { bookId } = req.params;

      const book = await Books.findByPk(bookId);
      const bookFiles = await BookFiles.findOne({ where: { bookId } });
      if (!book || !bookFiles.audio) {
        throw HttpError(404, 'book was not found');
      }
      // THIS PART OF CODE SHOULD BE IMPLEMENTED WHEN APP USERS HAVE PAID FOR AUDIO BOOK
      const userBook = await Orders.findOne({ where: { bookId } });
      if (!userBook) {
        throw HttpError(402, 'payment is required');
      }
      const file = path.join(path.resolve(), 'public', bookFiles.audio);
      const { size } = fs.statSync(file);
      const headers = {
        'Content-Length': size,
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
      };
      res.set(headers);
      const audioStream = fs.createReadStream(file);
      // Stream the audio chunk to the client
      audioStream.pipe(res);
      audioStream.on('error', (er) => {
        next(er);
      });
    } catch (er) {
      next(er);
    }
  };

  // download book

  static download = async (req, res, next) => {
    try {
      const { bookId } = req.params;

      const { authorization = '' } = req.headers;
      let userId;
      if (authorization) {
        const { userID } = jwt.verify(authorization.replace('Bearer ', ''), JWT_SECRET);
        userId = userID;
      }
      const book = await Books.findOne(
        { where: { $and: [{ price: { $is: null } }, { id: bookId }] } },
      );
      if (!book) {
        throw HttpError(422, 'book is not available for download');
      }
      const bookObj = { id: null, bookId: +bookId, userId: userId || null };
      const download = await Downloads.create(bookObj);

      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        download,
        book,
      });
    } catch (er) {
      next(er);
    }
  };

  // get books statistics

  // static statistics = async (req, res, next) => {
  //   try {} catch (er) {
  //     next(er);
  //   }
  // };
}

export default BooksController;
