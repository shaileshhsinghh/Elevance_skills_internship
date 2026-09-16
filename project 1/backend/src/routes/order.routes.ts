import { Router } from 'express';
import { createOrder, cancelOrder, requestRefund } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.post('/create', authenticate, createOrder);
router.post('/cancel/:orderId', authenticate, cancelOrder);
router.post('/refund/:orderId', authenticate, requestRefund);

export default router;