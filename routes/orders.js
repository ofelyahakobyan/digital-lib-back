import express from 'express';
import OrdersController from '../controllers/ordersController';
import validate from '../middlewares/validate';
import orders from '../schemas/orders';

const router = express.Router();

router.post('/checkout-session', validate(orders.checkoutSession), OrdersController.getCheckoutSession);
export default router;
