import { Router } from 'express';
import {
  getFlaggedOrders,
  approveOrder,
  rejectOrder,
  approveRefund,
  rejectRefund,
  restrictUser,
} from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate, isAdmin);

router.get('/fraud/orders', getFlaggedOrders);
router.put('/orders/:orderId/approve', approveOrder);
router.put('/orders/:orderId/reject', rejectOrder);
router.put('/orders/:orderId/refund/approve', approveRefund);
router.put('/orders/:orderId/refund/reject', rejectRefund);
router.put('/users/:userId/restrict', restrictUser);

export default router;