import express from 'express';
import passport from 'passport';
import UsersController from '../controllers/usersController';
import validate from '../middlewares/validate';
import users from '../schemas/user';

const router = express.Router();

router.post(
  '/signup',
  validate(users.registration),
  UsersController.registration,
);
router.post('/login', validate(users.login), UsersController.login);
router.get('/profile', UsersController.getProfile);
router.patch('/edit-profile', UsersController.editProfile);
router.post('/forgot-password', UsersController.forgotPassword);
router.post('/reset-password', UsersController.resetPassword);
router.post('/change-password', UsersController.changePassword);
router.get('/reviews', validate(users.reviews), UsersController.getReviews);
//  Social media authentication
router.get('/login-facebook', passport.authenticate('facebook', { session: false }));
// callback url
router.get('/facebook', passport.authenticate('facebook', { session: false }), (req, res) => res.send(req.user ? req.user : 'does not exists'));
export default router;
