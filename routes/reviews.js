import express from 'express';
import reviewsController from '../controllers/reviewsController';
import validate from '../middlewares/validate';
import reviews from '../schemas/reviews';
import authorization from '../middlewares/authorization';

const router = express.Router();
// admin
router.patch('/:reviewId', authorization('admin'), validate(reviews.adminEdit), reviewsController.adminEdit);
router.delete('/:reviewId', authorization('admin'), validate(reviews.adminDelete), reviewsController.adminDelete);
// logged user
router.patch('/user-reviews/:reviewId', authorization('login'));

// public
router.get('/', validate(reviews.list), reviewsController.list);
router.get('/book-reviews/:bookId');

export default router;
