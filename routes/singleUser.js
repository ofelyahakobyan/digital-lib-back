import express from 'express';
import UsersController from '../controllers/usersController';
import validate from '../middlewares/validate';
import users from '../schemas/user';

const router = express.Router();

router.post('/signup', validate(users.registration), UsersController.registration);
router.post('/login', validate(users.login), UsersController.login);
router.get('/profile', UsersController.getProfile);
router.put('/edit-profile', UsersController.editProfile);
router.post('/forgot-password', UsersController.forgotPassword);
router.post('/reset-password', UsersController.resetPassword);
router.post('/change-password', UsersController.changePassword);

export default router;
