import Mail from '../services/mail';
import { Contacts } from '../models';

class ContactsController {
  static add = async (req, res, next) => {
    try {
      const { email, firstName, lastName = null, message } = req.body;
      Mail.send(email, 'user message', 'message', {
        email,
        firstName: firstName || 'user',
        lastName,
        message,
      });

      // TODO add some info into database contacts model
      const contact = await Contacts.create({ firstName, lastName, email });
      res.status(200).json(
        {
          status: 'success',
          message: 'your message was successfully delivered',
          contact,
        },
      );
    } catch (er) {
      next(er);
    }
  };
}

export default ContactsController;
