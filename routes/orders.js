import express from 'express';
import OrdersController from '../controllers/ordersController';
import validate from '../middlewares/validate';
import orders from '../schemas/orders';
import authorization from '../middlewares/authorization';

const router = express.Router();

router.post('/checkout-session', authorization('login'), validate(orders.checkoutSession), OrdersController.getCheckoutSession);
export default router;
