import express from 'express';
import BooksController from '../controllers/booksController';
import coverUploader from '../middlewares/bookCoverUploader';

const router = express.Router();

router.get('/', BooksController.list);
router.get('/single/:bookId', BooksController.single);
router.post('/add', coverUploader, BooksController.add);

export default router;
