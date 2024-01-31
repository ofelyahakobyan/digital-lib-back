import { Stripe } from 'stripe';
import HttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import { Books, Users, Orders, UserBooks } from '../models';

const { STRIPE_SECRET_KEY, WEBHOOK_SECRET } = process.env;

const stripe = new Stripe(STRIPE_SECRET_KEY);
const endpointSecret = WEBHOOK_SECRET;

class OrdersController {
  static getCheckoutSession = async (req, res, next) => {
    try {
      // books is an array of bookIds, gotten from front end

      const transaction = uuidv4();
      const { books = [] } = req.body;
      const { userID } = req;
      const user = await Users.findByPk(userID);
      if (!user) {
        throw HttpError(422);
      }
      const validBooks = await Promise.all(
        books.map(async (book) => Books.findByPk(book, { raw: true })),
      );
      const userBooks = await Promise.all(
        books.map(async (book) => UserBooks.findOne({ raw: true, where: { bookId: book, userId: userID, status: 'cart' } })),
      );
      console.log(userBooks);
      const items = validBooks.map(({ price, description, title }) => (
        {
          price_data: {
            unit_amount: Math.round(price * 100),
            currency: 'usd',
            product_data: {
              name: title,
              description,
            },
          },
          quantity: 1,
        }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: 'http://localhost:3000/purchase-success',
        cancel_url: `http://localhost:3000/user/${userID}/card`,
        customer_email: user.email,
        client_reference_id: user.id,
        line_items: items,
        mode: 'payment',
      });

      await Promise.all(
        validBooks.map(async (book) => Orders.create({
          userId: userID,
          bookId: book.id,
          price: book.price,
          session_id: session.id,
          status: 'confirmed',
          transaction,
        })),
      );
      res.status(200).json({
        status: 'success',
        sessionURL: session.url,
        sessionId: session.id,
      });
    } catch (er) {
      next(er);
    }
  };

  static webhook = async (req, res, next) => {
    try {
      let event;
      const { transaction } = req.body;
      if (endpointSecret) {
        // const sig = req.headers['stripe-signature'];
        // event =  stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        event = req.body;
        const { type } = req.body;
        if (type === 'checkout.session.completed') {
          const books = await Orders.findAll({ where: { transaction } });
          await Promise.all(books.map(async (book) => {
            book.status = 'confirmed';
          }));
          const updated = await Orders.findAll({ raw: true, where: { transaction } });
          console.log(updated, 222);
        }
      }
      //
      // if(type === 'checkout.session.expired'){
      //   console.log(type);
      //  //
      // }
      if (!event) {
        throw HttpError(400, { error: { message: 'webhook error'} } );
      }
      res.status(200).json({ status: 'success' });
    } catch (er) {
      next(er);
    }
  };
}
export default OrdersController;
