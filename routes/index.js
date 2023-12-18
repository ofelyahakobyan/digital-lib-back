import express from 'express';
import users from './users';
import singleUser from './singleUser';
import books from './books';
import categories from './categories';
import authors from './authors';
import reviews from './reviews';
import publishers from './publishers';
import subscribers from './subscribers';
import orders from './orders';

const router = express.Router();

/* GET home page. */
router.use('/users', users);
router.use('/user', singleUser);
router.use('/books', books);
router.use('/categories', categories);
router.use('/authors', authors);
router.use('/publishers', publishers);
router.use('/reviews', reviews);
router.use('/subscribers', subscribers);
router.use('/orders', orders);
router.get('/', (req, res) => {
  console.log(req.cookies);
  res.json({
    status: 'success',
    title: 'digital library',
  });
});

export default router;
