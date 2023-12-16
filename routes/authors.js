import express from 'express';
import authorsController from '../controllers/authorsController';
import uploader from '../middlewares/avatarUploader';
import validate from '../middlewares/validate';
import authors from '../schemas/authors';
import authorization from '../middlewares/authorization';

const router = express.Router();

// public
router.get('/', validate(authors.list), authorsController.list);
// public
router.get('/single/:authorId', validate(authors.single), authorsController.single);
// admin
router.post('/add', uploader, authorization('admin'), validate(authors.add), authorsController.add);
// admin
router.patch('/edit/:authorId', uploader, authorization('admin'), validate(authors.edit), authorsController.edit);

export default router;
