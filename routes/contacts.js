import express from 'express';
import validate from '../middlewares/validate';
import contacts from '../schemas/contacts';
import contactsController from '../controllers/contactsController';

const router = express.Router();

router.post('/', validate(contacts.add), contactsController.add);

export default router;
