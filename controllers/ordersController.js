import { Stripe } from 'stripe';
import HttpError from 'http-errors';
import { Books, Users } from '../models';

const { STRIPE_SECRET_KEY } = process.env;
const stripe = Stripe(STRIPE_SECRET_KEY);

class OrdersController {
  static getCheckoutSession = async (req, res, next) => {
    try {
      // books is an array of bookIds, gotten from front end

      const { books } = req.body;
      const { userID } = req;
      const user = await Users.findByPk(userID);
      if (!user) {
        throw HttpError(422);
      }
      const validBooks = await Promise.all(
        books.map(async (book) => Books.findByPk(book)),
      );
      const items = validBooks.map((book) => ({
        price_data: {
          unit_amount: Math.round(book.price * 100),
          currency: 'usd',
          product_data: {
            name: book.title,
            description: book.description,
          },
        },
        quantity: 1,
      }));
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: 'http://localhost:4000/api/v1',
        cancel_url: 'http://localhost:4000/api/v1',
        customer_email: user.email,
        client_reference_id: user.id,
        line_items: items,
        mode: 'payment',
      });
      res.status(200).json({ status: 'success', session: session.url });
    } catch (er) {
      next(er);
    }
  };
}
export default OrdersController;
