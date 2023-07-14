import express from 'express';
import booksController from '../controllers/booksController';
import validate from '../middlewares/validate';
import books from '../schemas/books';

const router = express.Router();

router.get('/', booksController.list);
router.get('/single/:bookId', booksController.single);
export default router;
