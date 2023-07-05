import express from 'express';
import booksController from '../controllers/booksController';
import validate from '../middlewares/validate';
import books from '../schemas/books';

const router = express.Router();

router.get('/', validate(books.list), booksController.list);
export default router;
