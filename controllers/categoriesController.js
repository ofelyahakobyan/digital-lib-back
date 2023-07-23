import HttpError from 'http-errors';
import { Categories } from '../models';

class CategoriesController {
  // public
  static list = async (req, res, next) => {
    try {
      let { page = 1, limit = 20 } = req.query;
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
  static add = async (req, res, next) => {
    try {
      const { category, parentCategory = null } = req.body;
      let parent = '';
      if (parentCategory) {
        parent = await Categories.findOne({ where: { category: parentCategory } });
      }
      if (parentCategory && !parent) {
        throw HttpError(422, 'parent category does not exist');
      }
      const exists = await Categories.findOne({ where: { category } });
      if (exists) {
        throw HttpError(409, 'category already exists');
      }
      const newCategory = await Categories.create({
        category,
        parentCategory: parent.id || null,
      });
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        message: 'new category have been successfully created',
        category: newCategory,
      });
    } catch (er) {
      next(er);
    }
  };

  // admin role is required
  static edit = async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      const { category, parentCategory = null } = req.body;
      const editable = await Categories.findByPk(categoryId);
      const parent = await Categories.findOne({ where: { category: parentCategory } });
      if (!editable) {
        throw HttpError(404, 'category is not found');
      }
      editable.category = category || editable.category;
      editable.parentCategory = parent?.id || editable.parentCategory;
      editable.save();
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        message: 'category have been successfully modified',
        category: editable,
      });
    } catch (er) {
      next(er);
    }
  };
}

export default CategoriesController;
