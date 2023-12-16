import express from 'express';
import passport from 'passport';
import validate from '../middlewares/validate';
import users from '../schemas/user';
import UserBooksController from '../controllers/userBooksController';
import uploader from '../middlewares/avatarUploader';
import reviews from '../schemas/reviews';
import reviewsController from '../controllers/reviewsController';
import userBooks from '../schemas/userBooks';
import authorization from '../middlewares/authorization';
import UsersController from '../controllers/usersController';

const router = express.Router();

router.post('/registration', validate(users.registration), UsersController.registration);
router.post('/login', validate(users.login), UsersController.login);
router.get('/profile', authorization('login'), UsersController.getProfile);
router.patch('/profile', authorization('login'), uploader, validate(users.edit), UsersController.editProfile);
router.delete('/profile', authorization('login'), UsersController.deleteProfile);
router.post('/password-forgot', validate(users.passwordForgot), UsersController.forgotPassword);
router.post('/password-reset', validate(users.passwordReset), UsersController.resetPassword);
router.post('/password-change', validate(users.changePassword), UsersController.changePassword);
//  facebook  authentication
router.get('/auth-facebook', passport.authenticate('facebook', { session: false }));
// facebook callback url
router.get('/facebook', passport.authenticate('facebook', { session: false }), (req, res) => res.send(req.user ? req.user : 'does not exists'));

//  google  authentication
router.get('/auth-google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
// google callback url
router.get(
  '/google',
  passport.authenticate('google', { session: false }),
  UsersController.googleAuth,
);
// user Books
router.get('/wishlist', validate(userBooks.wishlist), UserBooksController.wishlist);
router.post('/wishlist/:bookId', validate(userBooks.add), UserBooksController.wishlistAdd);
router.delete('/wishlist/:bookId', validate(userBooks.delete), UserBooksController.wishlistDelete);

router.get('/cart', validate(userBooks.cart), UserBooksController.cart);
router.post('/cart/:bookId', validate(userBooks.add), UserBooksController.cartAdd);
router.delete('/cart/:bookId', validate(userBooks.delete), UserBooksController.cartDelete);

router.get('/reviews', validate(reviews.userList), reviewsController.userList);
router.post('/reviews/:bookId', validate(reviews.add), reviewsController.add);
router.patch('/reviews/:reviewId', validate(reviews.userEdit), reviewsController.userEdit);
router.delete('/reviews/:reviewId', validate(reviews.userDelete), reviewsController.userDelete);
export default router;
