import express from 'express';
import BooksController from '../controllers/booksController';
import coverUploader from '../middlewares/bookCoverUploader';
import filesUploader from '../middlewares/bookFilesUploader';
import ReviewsController from '../controllers/reviewsController';
import reviews from '../schemas/reviews';
import validate from '../middlewares/validate';
import books from '../schemas/books';

const router = express.Router();

router.get('/', validate(books.list), BooksController.list);
router.get('/author/:authorId', validate(books.authorList), BooksController.authorList);
router.get('/category/:categoryId', validate(books.categoryList), BooksController.categoryList);
router.get('/single/:bookId', validate(books.single), BooksController.single);
router.get('/reviews/:bookId', validate(reviews.bookList), ReviewsController.bookList);
router.post('/add', coverUploader, BooksController.add);
router.put('/add-files/:bookId', filesUploader, BooksController.addFiles);

export default router;
