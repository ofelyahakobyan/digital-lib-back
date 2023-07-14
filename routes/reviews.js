import express from 'express';
import reviewsController from '../controllers/reviewsController';

const router = express.Router();

// admin
router.get('/', reviewsController.list);
// logged user
router.post('/create/:bookId', reviewsController.create);

export default router;
