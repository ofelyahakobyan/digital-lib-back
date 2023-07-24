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
router.post('/add', validate(authors.add), authorUploader, authorsController.add);
// admin
router.patch('/edit/:authorId', validate(authors.edit), authorUploader, authorsController.edit);

export default router;
