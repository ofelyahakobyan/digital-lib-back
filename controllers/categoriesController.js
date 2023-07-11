import HttpError from 'http-errors';
import { Categories } from '../models';

class CategoriesController {
  // public
  static list = async (req, res, next) => {
    try {
      let { page = 1, limit = 10 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Categories.count();
      const categories = await Categories.findAll({
        limit,
        offset,
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        // include: { model: Categories, as: 'parent', attributes: ['category'] },
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        categories,
      });
    } catch (er) {
      next(er);
    }
  };

  // admin role is required
  static create = async (req, res, next) => {
    try {
      const { category, parentCategory = null } = req.body;
      let parent = '';
      if (parentCategory) {
        parent = await Categories.findOne({ where: { category: parentCategory } });
      }
      if (parentCategory && !parent) {
        throw HttpError(422);
      }
      const exists = await Categories.findOne({ where: { category } });
      if (exists) {
        throw HttpError(409, 'category already exists');
      }
      const newCategory = await Categories.create({
        category,
        parentCategory: parent.id,
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        message: 'new category successfully created',
        category: newCategory,
      });
    } catch (er) {
      next(er);
    }
  };
}

export default CategoriesController;
