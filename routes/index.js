import express from 'express';
import users from './users';
import singleUser from './singleUser';
import books from './books';

const router = express.Router();

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
