import HttpError from 'http-errors';
import publishers from '../models/publishers';

class PublishersController {
  static list = async (req, res, next) => {
    try {
      res.json({ text: 'hello' });
    } catch (e) {
      next(e);
    }
  };

  static createPublisher = async (req, res, next) => {
    try {
      const { companyName, country } = req.body;
      const exists = await publishers.findOne({ where: { companyName } });
      if (exists) {
        throw HttpError(403, 'This publisher is already registered');
      }
      const publisher = await publishers.create({ companyName, country });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        message: 'new publisher is successfully added',
        publisher,
      });
    } catch (e) {
      next(e);
    }
  };
}

export default PublishersController;
