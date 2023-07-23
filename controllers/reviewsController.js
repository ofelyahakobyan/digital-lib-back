import HttpError from 'http-errors';
import { Users, Books, Reviews } from '../models';

class ReviewsController {
  // public
  static list = async (req, res, next) => {
    try {
      let { page = 1, limit = 10 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Reviews.count();
      const reviews = await Reviews.findAll({
        limit,
        offset,
        include: [
          {
            model: Books,
            as: 'book',
            attributes: ['id', 'title', 'description'],
          },
          {
            model: Users,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'avatar'],
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
        reviews,
      });
    } catch (er) {
      next(er);
    }
  };

  // logged-in  user role is required
  static userList = async (req, res, next) => {
    try {
      const { userID } = req;
      let { page = 1, limit = 10 } = req.query;
      const where = { id: userID };
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Reviews.count({ where });
      // TODO customize for design
      const reviews = await Reviews.findAll(
        {
          limit,
          offset,
          where,
          include: [{ model: Books, as: 'book' }],
        },
      );
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        reviews,
      });
    } catch (er) {
      next(er);
    }
  };

  // logged-in user role is required
  static add = async (req, res, next) => {
    try {
      const { userID } = req;
      const { bookId } = req.params;
      // Joi validation
      const book = await Books.findByPk(bookId);
      if (!book) {
        throw HttpError(404, 'book does not exist');
      }
      const exists = await Reviews.findOne({ where: { userId: userID, bookId } });
      if (exists) {
        throw HttpError(409, 'user have already reviewed this book');
      }
      const { title, content = '', rating } = req.body;
      const review = await Reviews.create({
        bookId: +bookId,
        userId: userID,
        title,
        content,
        rating: +rating,
      });
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        review,

      });
    } catch (er) {
      next(er);
    }
  };

  // logged-in role is required
  static userEdit = async (req, res, next) => {
    try {
      const { userID } = req;
      const { reviewId } = req.params;
      const {
        title,
        content,
        rating,
      } = req.body;
      const review = await Reviews.findByPk(reviewId, { where: { userId: userID } });
      if (!review) {
        throw HttpError(404, 'review not found');
      }
      review.title = title || review.title;
      review.content = content || review.content;
      review.rating = +rating || review.rating;
      await review.save();
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        review,
      });
    } catch (er) {
      next(er);
    }
  };

  // logged-in role is required
  static userDelete = async (req, res, next) => {
    try {
      const { userID } = req;
      const { reviewId } = req.params;
      const review = await Reviews.findByPk(reviewId, { where: { userId: userID } });
      if (!review) {
        throw HttpError(404, 'review not found');
      }
      await review.destroy();
      res.status(204).json({ status: 'success' });
    } catch (er) {
      next(er);
    }
  };

  // admin role is required
  static adminEdit = async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const {
        title,
        content,
      } = req.body;
      const review = await Reviews.findByPk(
        reviewId,
        {
          include: [
            { model: Users, as: 'user' },
            { model: Books, as: 'book' },
          ],
        },
      );
      if (!review) {
        throw HttpError(404, 'review is not found');
      }
      review.title = title || review.title;
      review.content = content || review.content;
      await review.save();
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        review,
      });
    } catch (er) {
      next(er);
    }
  };

  // admin role is required
  static adminDelete = async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const review = await Reviews.findByPk(reviewId);
      if (!review) {
        throw HttpError(404, 'review is not found');
      }
      res.status(204).json({ status: 'success' });
    } catch (er) {
      next(er);
    }
  };

  // public
  static bookList = async (req, res, next) => {
    try {
      const { bookId } = req.params;
      let { page = 1, limit = 10 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const where = { bookId };
      const total = await Reviews.count({ where });
      const reviews = await Reviews.findAll({
        limit,
        offset,
        where,
        include: {
          model: Users,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        reviews,
      });
    } catch (er) {
      next(er);
    }
  };
}

export default ReviewsController;
