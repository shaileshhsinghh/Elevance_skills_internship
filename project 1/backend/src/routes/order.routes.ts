import { Router } from 'express';
import { createOrder, cancelOrder } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create', authenticate, createOrder);
router.post('/cancel/:orderId', authenticate, cancelOrder);

export default router;