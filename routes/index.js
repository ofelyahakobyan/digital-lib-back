import express from 'express';
import passport from 'passport';
import users from './users';
import singleUser from './singleUser';
import books from './books';

const router = express.Router();
//  Social media authentication
router.get('/user/login-facebook', passport.authenticate('facebook', { session: false }));
// callback urls
router.get('/user/facebook', passport.authenticate('facebook', { session: false }), (req, res) => res.send(req.user ? req.user : 'does not exists'));

/* GET home page. */
router.use('/users', users);
router.use('/user', singleUser);
router.use('/books', books);
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    title: 'digital library',
  });
});

export default router;
