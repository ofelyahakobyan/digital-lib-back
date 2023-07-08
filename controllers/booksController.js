import { Books, Authors, Categories, Reviews } from '../models/index';
import sequelize from '../services/sequelize';

class booksController {
  static list = async (req, res, next) => {
    try {
      let { page = 1, limit = 20 } = req.query;
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
                '(select count(bookId) from reviews where bookId=id)',
              ),
              'totalReviews',
            ],
            [
              sequelize.literal(
                '(select ceil(avg(rating)) from reviews where bookId=id)',
              ),
              'averageRating',
            ],
          ],
        },
        where: { $not: { status: 'unavailable' } },
        include: [
          {
            model: Authors,
            attributes: ['fullName'],
          },
          {
            model: Categories,
            through: { attributes: [] },
            attributes: { exclude: ['createdAt', 'updatedAt'] },
          },
          {
            model: Reviews,
            attributes: [],
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
        data: { books },
      });
    } catch (er) {
      next(er);
    }
  };
}

export default booksController;
