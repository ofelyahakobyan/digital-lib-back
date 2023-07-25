import express from 'express';
import path from 'path';
import users from './users';
import singleUser from './singleUser';
import books from './books';
import categories from './categories';
import authors from './authors';
import reviews from './reviews';
import publishers from './publishers';

const router = express.Router();

/* GET home page. */
router.use('/users', users);
router.use('/user', singleUser);
router.use('/books', books);
router.use('/categories', categories);
router.use('/authors', authors);
router.use('/publishers', publishers);
router.use('/reviews', reviews);
router.get('/images/authors/:filename', (req, res, next) => {
  const { filename } = req.params;
  const p = path.join(path.resolve(), 'public/images/authors', filename);
  // console.log('filename', filename);
  // console.log('p', p);
  // console.log('path', req.path);
  res.sendFile(p);
});
router.get('/', (req, res) => {
  console.log(req.cookies);
  res.json({
    status: 'success',
    title: 'digital library',
  });
});

export default router;
