import express from 'express';
import BooksController from '../controllers/booksController';

const router = express.Router();

router.get('/', BooksController.list);
router.get('/single/:bookId', BooksController.single);
router.post('/add', BooksController.add);

export default router;
