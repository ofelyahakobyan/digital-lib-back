import express from 'express';
import authorsController from '../controllers/authorsController';
import authorUploader from '../middlewares/authorAvatarUploader';
import validate from '../middlewares/validate';
import authors from '../schemas/authors';

const router = express.Router();

// public
router.get('/', validate(authors.list), authorsController.list);
// admin
router.post('/create', authorUploader, authorsController.create);
// admin
router.patch('/edit/:authorId', authorUploader, authorsController.edit);
export default router;
