import express from 'express';
import categories from '../schemas/categories';
import validate from '../middlewares/validate';
import categoriesController from '../controllers/categoriesController';
import authorization from '../middlewares/authorization';

const router = express.Router();

// public
router.get('/', validate(categories.list), categoriesController.list);
// public
router.get('/:category', validate(categories.single), categoriesController.single);
// admin
router.post('/add', authorization('admin'), validate(categories.add), categoriesController.add);
// admin
router.patch('/edit/:categoryId', authorization('admin'), validate(categories.edit), categoriesController.edit);

export default router;
