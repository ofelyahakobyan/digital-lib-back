import express from 'express';
import passport from 'passport';
import UsersController from '../controllers/usersController';
import validate from '../middlewares/validate';
import users from '../schemas/user';
import UserBooksController from '../controllers/userBooksController';
import avatarUploader from '../middlewares/userAvatarUploader';

const router = express.Router();

router.post('/registration', validate(users.registration), UsersController.registration);
router.post('/login', validate(users.login), UsersController.login);
router.get('/profile', UsersController.getProfile);
router.patch('/profile', validate(users.edit), avatarUploader, UsersController.editProfile);
router.post('/password-forgot', validate(users.passwordForgot), UsersController.forgotPassword);
router.post('/password-reset', validate(users.passwordReset), UsersController.resetPassword);
router.post('/password-change', validate(users.changePassword), UsersController.changePassword);
//  Social media authentication
router.get('/login-facebook', passport.authenticate('facebook', { session: false }));
// callback url
router.get('/facebook', passport.authenticate('facebook', { session: false }), (req, res) => res.send(req.user ? req.user : 'does not exists'));

// user Books
router.get('/wishlist', UserBooksController.wishlist);
router.post('/wishlist/:bookId', UserBooksController.wishlistAdd);
router.delete('/wishlist/:bookId', UserBooksController.wishlistDelete);

router.get('/cart', UserBooksController.cart);
router.post('/cart/:bookId', UserBooksController.cartAdd);
router.delete('/cart/:bookId', UserBooksController.cartDelete);

export default router;
