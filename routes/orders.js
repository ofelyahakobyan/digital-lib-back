import express from 'express';
import OrdersController from '../controllers/ordersController';
import validate from '../middlewares/validate';
import orders from '../schemas/orders';
import authorization from '../middlewares/authorization';

const router = express.Router();

router.post('/checkout-session', /* validate(orders.checkoutSession), */ authorization('login'), OrdersController.getCheckoutSession);
// router.post('/webhook', OrdersController.webhook);

export default router;
