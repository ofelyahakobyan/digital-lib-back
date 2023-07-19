import express from 'express';
import reviewsController from '../controllers/reviewsController';
import validate from '../middlewares/validate';
import users from '../schemas/user';
import UsersController from '../controllers/usersController';

const router = express.Router();
// admin
router.get('/', reviewsController.list);
// logged user
router.post('/create/:bookId', reviewsController.create);

export default router;
