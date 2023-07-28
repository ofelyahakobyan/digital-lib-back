import express from 'express';
import BooksController from '../controllers/booksController';
import ReviewsController from '../controllers/reviewsController';
import reviews from '../schemas/reviews';
import validate from '../middlewares/validate';
import books from '../schemas/books';
import bookUploader from '../middlewares/bookUploader';

const router = express.Router();

router.get('/', validate(books.list), BooksController.list);
router.get('/author/:authorId', validate(books.authorList), BooksController.authorList);
router.get('/category/:categoryId', validate(books.categoryList), BooksController.categoryList);
router.get('/single/:bookId', validate(books.single), BooksController.single);
router.get('/:bookId/reviews', validate(reviews.bookList), ReviewsController.bookList);
router.post('/add', bookUploader, validate(books.add), BooksController.add);
router.patch('/:bookId', bookUploader, validate(books.single), BooksController.edit);
router.delete('/:bookId', validate(books.single), BooksController.delete);
router.get('/:bookId/preview', validate(books.single), BooksController.preview);

// logged-in user endpoints
// router.get('/:bookId/full', validate(books.single), BooksController.preview);
// router.get('/:bookId/audio', validate(books.single), BooksController.preview);

export default router;
