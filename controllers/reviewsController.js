import HttpError from 'http-errors';
import { Books, Reviews } from '../models';

class ReviewsController {
  // public is required
  static list = async (req, res, next) => {
    try {
      const reviews = await Reviews.findAll();
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        reviews,
      });
    } catch (er) {
      next(er);
    }
  };

  // logged  user role is required
  static userList = async (req, res, next) => {
    try {
      const { userID } = req;
      if (!userID) {
        throw HttpError(401);
      }
      let { page = 1, limit = 2 } = req.query;
      const where = { id: userID };
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Reviews.count({ where });
      // TODO customize for design
      const reviews = await Reviews.findAll({ limit, offset, where, include: { model: Books } });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        reviews,
      });
    } catch (er) { next(er); }
  };

  // logged user role required
  static create = async (req, res, next) => {
    try {
      const { userID } = req;
      const { bookId } = req.params;
      // Joi validation

      const book = await Books.findByPk(+bookId);
      if (!book) {
        throw HttpError(404, 'book does not exist');
      }
      const { title = '', content = '', rating = '' } = req.body;
      const review = await Reviews.create({ bookId, userId: userID, title, content, rating });

      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        review,

      });
    } catch (er) {
      next(er);
    }
  };
}

export default ReviewsController;
