import express from 'express';
import booksController from '../controllers/booksController';

const router = express.Router();

router.get('/', booksController.list);
router.get('/single/:bookId', booksController.single);

export default router;
