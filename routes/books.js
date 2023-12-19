import express from 'express';
import BooksController from '../controllers/booksController';
import ReviewsController from '../controllers/reviewsController';
import validate from '../middlewares/validate';
import bookUploader from '../middlewares/bookUploader';
import authorization from '../middlewares/authorization';
import books from '../schemas/books';
import reviews from '../schemas/reviews';

const router = express.Router();

router.get('/', validate(books.list), BooksController.list);
router.get('/author/:authorId', validate(books.authorList), BooksController.authorList);
router.get('/category/:categoryId', validate(books.categoryList), BooksController.categoryList);
router.get('/single/:bookId', validate(books.single), BooksController.single);
router.get('/:bookId/reviews', validate(reviews.bookList), ReviewsController.bookList);

router.post('/add', bookUploader, authorization('admin'), validate(books.add), BooksController.add);
router.patch('/:bookId', bookUploader, authorization('admin'), validate(books.single), BooksController.edit);
router.delete('/:bookId', authorization('admin'), validate(books.single), BooksController.delete);
router.get('/:bookId/preview', validate(books.single), BooksController.preview);
router.get('/:bookId/download', authorization('login'), validate(books.download), BooksController.download);

// logged-in user endpoints
router.get('/:bookId/full', authorization('login'), validate(books.single), BooksController.full);
router.get('/:bookId/audio', validate(books.single), BooksController.audio);

export default router;
