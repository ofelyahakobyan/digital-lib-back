import { Books } from '../models/index';
import Authors from '../models/authors';
import Files from '../models/files';

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
        include: [
          {
            model: Authors,
            attributes: ['firstName', 'lastName', 'fullName'],
          },
          {
            model: Files,
            attributes: { exclude: ['bookId', 'createdAt', 'updatedAt'] },
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
