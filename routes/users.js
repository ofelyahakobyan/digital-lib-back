import express from 'express';
import UsersController from '../controllers/usersController';
import validate from '../middlewares/validate';
import users from '../schemas/user';

const router = express.Router();

router.get('/', validate(users.list), UsersController.list);
export default router;
