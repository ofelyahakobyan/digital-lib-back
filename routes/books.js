import express from 'express';
import BooksController from '../controllers/booksController';
import coverUploader from '../middlewares/bookCoverUploader';
import filesUploader from '../middlewares/bookFilesUploader.js';

const router = express.Router();

router.get('/', BooksController.list);
router.get('/single/:bookId', BooksController.single);
router.post('/add', coverUploader, BooksController.add);
router.put('/add-files/:bookId', filesUploader, BooksController.addFiles);

export default router;
