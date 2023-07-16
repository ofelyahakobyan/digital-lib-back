import HttpError from 'http-errors';
import { Authors, Books, Reviews, UserBooks, Users } from '../models';
import sequelize from '../services/sequelize';

class UserBooksController {
  static wishlist = async (req, res, next) => {
    try {
      const { userID } = req;
      let { page = 1, limit = 8 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await UserBooks.count({ where: { $and: [{ userId: userID }, { status: 'wish' }] } });
      const items = await Books.findAll(
        {
          page,
          offset,
          where: { status: 'available' },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'publisherId', 'desc'],
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
              model: Users,
              where: { id: userID },
              attributes: [],
              through: { model: UserBooks },
              as: 'users',
            },
            { model: Authors, as: 'author', attributes: { exclude: ['createdAt', 'updatedAt', 'dob', 'bio'] } },
            { model: Reviews, attributes: [] },
          ],
        },
      );
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        totalItems: total,
        items,
      });
    } catch (er) {
      next(er);
    }
  };

  static wishlistAdd = async (req, res, next) => {
    try {
      const { userID } = req;
      const { bookId } = req.params;
      const exists = await Books.findByPk(bookId);
      if (!exists) {
        console.log('not exists');
        throw HttpError(404);
      }
      const item = await UserBooks.create({ userId: userID, bookId: +bookId, status: 'wish' });
      if (!item) {
        throw HttpError(400);
      }
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        item,
      });
    } catch (er) {
      next(er);
    }
  };

  static cart = async (req, res, next) => {
    try {
      const { userID } = req;
      let { page = 1, limit = 8 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await UserBooks.count({ where: { $and: [{ userId: userID }, { status: 'cart' }] } });
      const items = await Books.findAll(
        {
          page,
          offset,
          where: { status: 'available' },
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'publisherId', 'desc'],
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
              model: Users,
              where: { id: userID },
              attributes: [],
              through: { model: UserBooks },
              as: 'users',
            },
            { model: Authors, as: 'author', attributes: { exclude: ['createdAt', 'updatedAt', 'dob', 'bio'] } },
            { model: Reviews, attributes: [] },
          ],
        },
      );
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        totalItems: total,
        items,
      });
    } catch (er) {
      next(er);
    }
  };

  static cartAdd = async (req, res, next) => {
    try {
      const { userID } = req;
      const { bookId } = req.params;
      const exists = await Books.findByPk(bookId);
      if (!exists) {
        throw HttpError(404);
      }
      const item = await UserBooks.create({ userId: userID, bookId: +bookId, status: 'cart' });
      if (!item) {
        throw HttpError(400);
      }
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        item,
      });
    } catch (er) {
      next(er);
    }
  };
}

export default UserBooksController;
