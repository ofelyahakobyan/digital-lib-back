import express from 'express';
import PublishersController from '../controllers/publishersController';
import validate from '../middlewares/validate';
import publishers from '../schemas/publishers';

const router = express.Router();

router.get('/', PublishersController.list);
router.post('/create', validate(publishers), PublishersController.createPublisher);
export default router;
