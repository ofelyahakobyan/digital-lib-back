import HttpError from 'http-errors';
import { Subscribers, Users } from '../models';
import Mail from '../services/mail';

class SubscribersController {
  static add = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await Users.findOne({ where: { email } });
      const userId = user ? user.id : null;
      const exists = await Subscribers.findOne({ where: { email } });
      if (exists) {
        throw HttpError(422, 'user is  already subscribed');
      }
      const subscriber = await Subscribers.create(
        { email, userId },
      );
      res.status(201).json({
        code: res.statusCode,
        status: 'success',
        message: 'user was successfully subscribed',
        subscriber,
      });
    } catch (er) {
      next(er);
    }
  };

  // admin role is required
  static list = async (req, res, next) => {
    try {
      let { page = 1, limit = 20 } = req.query;
      page = +page;
      limit = +limit;
      const offset = (page - 1) * limit;
      const total = await Subscribers.count();
      const users = await Subscribers.findAll({
        limit,
        offset,
        where: { status: 'subscribed' },
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        total,
        users,
      });
    } catch (er) {
      next(er);
    }
  };

  static sendNews = async (req, res, next) => {
    // bullmq for heavy tasks
    try {
      const { title, text } = req.body;
      const subscribers = await Subscribers.findAll({ where: { status: 'subscribed' } });
      await subscribers.forEach((subscriber) => {
        Mail.send(subscriber.email, 'Digital Library News', 'news', { title, text });
      });
      res.status(200).json({
        code: res.statusCode,
        status: 'success',
        subscribers,
      });
    } catch (er) {
      next(er);
    }
  };
}

export default SubscribersController;
