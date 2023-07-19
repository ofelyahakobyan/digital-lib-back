import HttpError from 'http-errors';
import { Books, Authors, Categories, Reviews, BookCategories } from '../models';
import sequelize from '../services/sequelize';

class booksController {
  // public
  static list = async (req, res, next) => {
    try {
      let { page = 1, limit = 9 } = req.query;
      const { minPrice = 0, maxPrice = 100000000000, rating, format = ['text', 'audio'], language, authorId, popular, brandNew, bestseller, q } = req.query;
      let { categoryId } = req.query;
      const initialConditions = {
        status: { $not: 'unavailable' },
        price: {
          $and: {
            $gte: minPrice,
            $lte: maxPrice,
          },
        },
      };
      let where = initialConditions;
      if (format === 'text') {
        where.audio = false;
      }
      if (format === 'audio') {
        where.audio = true;
      }
      if (language) {
        where.language = language.toLowerCase();
      }
      if (authorId) {
        where.authorId = authorId;
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
      let itemsByCategories = [];

      if (q) {
        categoryId = '';
        where = initialConditions;
        const cats = await Categories.findOne({ where: { category: { $like: `%${q}%` } } });
        if (cats && !categoryId) {
          const items = await BookCategories.findAll({ where: { categoryId: cats.id }, raw: true });
          itemsByCategories = items.map((item) => item.bookId);
        }
        where.$or = [
          { title: mask },
          { description: mask },
          { id: { $in: itemsByCategories } },
          { '$author.firstName$': mask },
          { '$author.lastName$': mask },
        ];
      }
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Books.count();
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
            where: categoryId ? { id: categoryId } : { },
            required: !!categoryId,
            through: { attributes: [] },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
          {
            model: Reviews,
            attributes: [],
            as: 'reviews',
            where: rating ? sequelize.where(sequelize.literal('(select ceil(avg(rating)) from reviews group by bookId having bookId=books.id )'), { $eq: rating }) : {},
            required: !!rating,
          },
        ],
      });
      const totalFound = books.length;
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        totalFound,
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

  // TODO here should  be book upload API
}

export default booksController;
