import express from 'express';
import validate from '../middlewares/validate';
import subscribersController from '../controllers/subscribersController';
import subscribers from '../schemas/subscribers';

const router = express.Router();
// public
router.get('/', validate(subscribers.list), subscribersController.list);
// admin
router.post('/add', validate(subscribers.add), subscribersController.add);
router.post('/send-news', subscribersController.sendNews);

export default router;
