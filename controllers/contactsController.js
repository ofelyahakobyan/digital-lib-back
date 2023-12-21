import Mail from '../services/mail';

class ContactsController {
  static add = async (req, res, next) => {
    try {
      // 1) send message to the company mail
      // 2) if message is sent success response sent to the client
      // 3) if message can not be sent an error should be sent to the client

      const { email, firstName, lastName = null, message } = req.body;
      Mail.send(email, 'user message', 'message', {
        email,
        firstName: firstName || 'user',
        lastName,
        message,
      });
      res.status(200).json(
        {
          status: 'success',
          message: 'your message was successfully delivered',
        },
      );
    } catch (er) {
      next(er);
    }
  };
}

export default ContactsController;
