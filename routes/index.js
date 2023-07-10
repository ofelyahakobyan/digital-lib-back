import express from 'express';
import users from './users';
import singleUser from './singleUser';
import books from './books';
import admin from './admin';

const router = express.Router();

/* GET home page. */
router.use('/users', users);
router.use('/user', singleUser);
router.use('/books', books);
router.use('/admin', admin);
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    title: 'digital library',
  });
});

export default router;
