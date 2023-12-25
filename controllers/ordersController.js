import { Stripe } from 'stripe';
import HttpError from 'http-errors';
import { v4 as uuidv4 } from 'uuid';
import { Books, Users, Orders } from '../models';

const { WEBHOOK_SECRET, STRIPE_SECRET_KEY } = process.env;

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
        const data = req.body.data.object;
        if (type === 'checkout.session.completed') {
          const customer = await stripe.customers.retrieve(data.customer);
          // TODO send data to grpc and data into
          const books = await Orders.findAll({ where: { transaction } });

          console.log(books, 111);
          await Promise.all(books.map(async book => {
            book.status= 'confirmed';
            await book.save();
          }));
          const updated = await Orders.findAll({raw:true, where:{transaction}})
          console.log(updated, 222);
        }
      }
      //
      // if(type === 'checkout.session.expired'){
      //   console.log(type);
      //  //
      // }
      if(!event){
        throw  HttpError(400, {error: {message: 'webhook error'}} );
      }
      res.status(200).json({ status: 'success' });
    } catch (er) {
      next(er);
    }
  };
}
export default OrdersController;