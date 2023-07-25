import express from 'express';
import authorsController from '../controllers/authorsController';
import authorUploader from '../middlewares/authorAvatarUploader';
import validate from '../middlewares/validate';
import authors from '../schemas/authors';

const router = express.Router();

// public
router.get('/', validate(authors.list), authorsController.list);
// public
router.get('/single/:authorId', validate(authors.single), authorsController.single);
// admin
router.post('/add', authorUploader, validate(authors.add), authorsController.add);
// admin
router.patch('/edit/:authorId', authorUploader, validate(authors.edit), authorsController.edit);

export default router;
