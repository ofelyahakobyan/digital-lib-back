import express from 'express';
import adminController from '../controllers/adminController';
import categories from '../schemas/categories';
import validate from '../middlewares/validate';

const router = express.Router();
router.post('/create-category', validate(categories.create), adminController.createCategory);
router.get('/categories', validate(categories.list), adminController.list);
export default router;
