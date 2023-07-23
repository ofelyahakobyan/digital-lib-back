import express from 'express';
import reviewsController from '../controllers/reviewsController';
import validate from '../middlewares/validate';
import reviews from '../schemas/reviews';

const router = express.Router();
// admin
router.patch('/:reviewId', validate(reviews.adminEdit), reviewsController.adminEdit);
router.delete('/:reviewId', validate(reviews.adminDelete), reviewsController.adminDelete);
// logged user
router.patch('/user-reviews/:reviewId');

// public
router.get('/', validate(reviews.list), reviewsController.list);
router.get('/book-reviews/:bookId');

export default router;
