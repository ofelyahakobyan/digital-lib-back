import { Books } from '../models/index';

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
