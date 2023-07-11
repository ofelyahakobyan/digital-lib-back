import express from 'express';
import categories from '../schemas/categories';
import validate from '../middlewares/validate';
import categoriesController from '../controllers/categoriesController';

const router = express.Router();

// public
router.get('/', validate(categories.list), categoriesController.list);
// admin
router.post('/create', validate(categories.create), categoriesController.create);

export default router;
