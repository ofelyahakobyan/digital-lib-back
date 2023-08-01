import { Stripe } from 'stripe';
import { Books, Users } from '../models';

const { STRIPE_SECRET_KEY } = process.env;

const stripe = Stripe(STRIPE_SECRET_KEY);
// console.log(stripe);
class OrdersController {
  static getCheckoutSession = async (req, res, next) => {
    try {
      const { bookId } = req.body;
      const { userID } = req;
      const user = await Users.findByPk(userID);

      const book = await Books.findOne({ where: { id: bookId } });
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: 'http://localhost:4000/api/v1',
        cancel_url: 'http://localhost:4000/api/v1/user/login',
        customer_email: user.email,
        client_reference_id: book.id,
        line_items: [{
          price_data: {
            unit_amount: book.price * 100,
            currency: 'usd',
            product_data: {
              name: book.title,
              description: 'Good Book',
            },
          },
          quantity: 1,
        }],
        mode: 'payment',
      });
      res.status(200).json({ status: 'success', session });
    } catch (er) {
      next(er);
    }
  };
}
export default OrdersController;
