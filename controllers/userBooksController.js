import HttpError from 'http-errors';
import { Authors, BookFiles, Books, Reviews, UserBooks, Users, Orders } from '../models';
import sequelize from '../services/sequelize';
import userBooks from '../models/userBooks';

class UserBooksController {
  static wishlist = async (req, res, next) => {
    try {
      const { userID } = req;
      let { page = 1, limit = 8 } = req.query;
      console.log(userID);
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const where = { userId: userID, status: 'wish' };
      const total = await UserBooks.count({ where });
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
              through: { model: UserBooks, where: { status: 'wish' } },
              as: 'users',
            },
            {
              model: Authors,
              as: 'author',
              attributes: { exclude: ['createdAt', 'updatedAt', 'dob', 'bio'] },
            },
            { model: Reviews, as: 'reviews', attributes: [] },
            { model: BookFiles, as: 'bookFiles', attributes: { exclude: ['fullPDF'] } },
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
      const where = { userId: userID, bookId: +bookId, status: 'wish' };
      const bookExists = await Books.findByPk(bookId);
      if (!bookExists) {
        throw HttpError(404, 'book with the provided  id does not exist');
      }
      const itemExists = await UserBooks.findOne({ where });
      if (itemExists) {
        throw HttpError(409, 'item already on the wishlist');
      }
      const total = await UserBooks.count({
        where: {
          userId: userID,
          status: 'wish',
        },
      });
      if (total === 100) {
        throw HttpError(400, 'Exceeded the maximum limit of 100 items in the wishlist.');
      }
      const item = await UserBooks.create(where);
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

  static wishlistDelete = async (req, res, next) => {
    try {
      const { userID } = req;
      const { bookId } = req.params;
      const where = { userId: userID, bookId, status: 'wish' };
      const item = await UserBooks.findOne({ where });
      if (!item) {
        throw HttpError(404, 'book not found on users wishlist');
      }
      await item.destroy();
      res.status(204).json({ status: 'success' });
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
      const where = { userId: userID, status: 'cart' };
      const quantity = await UserBooks.count({ where });
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
                  '(select ceil(avg(rating)) from reviews group by bookId having bookId=id )',
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
              through: { model: UserBooks, where: { status: 'cart' } },
              as: 'users',
            },
            { model: Authors, as: 'author', attributes: { exclude: ['createdAt', 'updatedAt', 'dob', 'bio'] } },
            { model: Reviews, as: 'reviews', attributes: [] },
            { model: BookFiles, as: 'bookFiles' },
          ],
        },
      );
      const totalPrice = items.reduce((acc, cur) => acc + cur.price, 0);
      // hard codded up to getting the meaning
      const discount = 0;
      const subTotal = totalPrice - discount;
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(quantity / limit),
        limit,
        quantity,
        totalPrice,
        discount,
        subTotal,
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
      const where = { userId: userID, bookId: +bookId, status: 'cart' };
      let item = {};
      const total = await UserBooks.count({
        where: {
          userId: userID,
          status: 'cart',
        },
      });
      if (total === 100) {
        throw HttpError(400, 'Exceeded the maximum limit of 100 items in the wishlist.');
      }
      const bookExists = await Books.findByPk(bookId);
      if (!bookExists) {
        throw HttpError(404, 'book with the provided  id does not exist');
      }
      const itemExists = await UserBooks.findOne({ where });
      if (itemExists) {
        throw HttpError(409, 'item already on the cart');
      }
      const itemOnTheWishList = await userBooks.findOne({ where: { ...where, status: 'wish' } });
      if (itemOnTheWishList) {
        console.log(itemOnTheWishList.status);
        itemOnTheWishList.status = 'cart';
        await itemOnTheWishList.save();
        item = itemOnTheWishList;
      } else {
        item = await UserBooks.create(where);
      }
      if (!item) {
        throw HttpError(400, 'can not to add item to the cart');
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

  static cartDelete = async (req, res, next) => {
    try {
      const { userID } = req;
      const { bookId } = req.params;
      const where = { userId: userID, bookId, status: 'cart' };
      const item = await UserBooks.findOne({ where });
      if (!item) {
        throw HttpError(404, 'book not found on users cart');
      }
      await item.destroy();
      res.status(204).json({ status: 'success' });
    } catch (er) {
      next(er);
    }
  };

  static library = async (req, res, next) => {
    try {
      const { userID } = req;
      let { page = 1, limit = 8 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const where = { userId: userID, status: 'confirmed' };
      const total = await Orders.count({ where });
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
              through: { model: Orders, where: { status: 'confirmed' } },
              as: 'users',
            },
            {
              model: Authors,
              as: 'author',
              attributes: { exclude: ['createdAt', 'updatedAt', 'dob', 'bio'] },
            },
            { model: Reviews, as: 'reviews', attributes: [] },
            { model: BookFiles, as: 'bookFiles', attributes: { exclude: ['fullPDF'] } },
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
}

export default UserBooksController;
