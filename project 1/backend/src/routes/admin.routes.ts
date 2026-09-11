import { Router } from 'express';
import {
  getFlaggedOrders,
  approveOrder,
  rejectOrder,
  restrictUser,
} from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

router.get('/fraud/orders', getFlaggedOrders);
router.put('/orders/:orderId/approve', approveOrder);
router.put('/orders/:orderId/reject', rejectOrder);
router.put('/users/:userId/restrict', restrictUser);

export default router;