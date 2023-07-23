import express from 'express';
import categories from '../schemas/categories';
import validate from '../middlewares/validate';
import categoriesController from '../controllers/categoriesController';

const router = express.Router();

// public
router.get('/', validate(categories.list), categoriesController.list);
// admin
router.post('/add', validate(categories.add), categoriesController.add);
// admin
router.patch('/edit/:categoryId', validate(categories.edit), categoriesController.edit);

export default router;
