import express from 'express';
import passport from 'passport';
import validate from '../middlewares/validate';
import users from '../schemas/user';
import UserBooksController from '../controllers/userBooksController';
import reviews from '../schemas/reviews';
import reviewsController from '../controllers/reviewsController';
import userBooks from '../schemas/userBooks';
import authorization from '../middlewares/authorization';
import UsersController from '../controllers/usersController';

const router = express.Router();

router.post('/registration', validate(users.registration), UsersController.registration);
router.post('/login', validate(users.login), UsersController.login);
router.get('/profile', authorization('login'), UsersController.getProfile);
router.patch('/profile', authorization('login'), validate(users.edit), UsersController.editProfile);
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
router.get('/wishlist', authorization('login'), validate(userBooks.wishlist), UserBooksController.wishlist);
router.post('/wishlist/:bookId', authorization('login'), validate(userBooks.add), UserBooksController.wishlistAdd);
router.delete('/wishlist/:bookId', authorization('login'), validate(userBooks.delete), UserBooksController.wishlistDelete);

router.get('/cart', authorization('login'), validate(userBooks.cart), UserBooksController.cart);
router.post('/cart/:bookId', authorization('login'), validate(userBooks.add), UserBooksController.cartAdd);
router.delete('/cart/:bookId', authorization('login'), validate(userBooks.delete), UserBooksController.cartDelete);

router.get('/reviews', authorization('login'), validate(reviews.userList), reviewsController.userList);
router.post('/reviews/:bookId', authorization('login'), validate(reviews.add), reviewsController.add);
router.patch('/reviews/:reviewId', authorization('login'), validate(reviews.userEdit), reviewsController.userEdit);
router.delete('/reviews/:reviewId', authorization('login'), validate(reviews.userDelete), reviewsController.userDelete);

router.get('/library', authorization('login'), UserBooksController.library);
export default router;
