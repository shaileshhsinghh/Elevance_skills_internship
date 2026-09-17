import { Router } from 'express';
import { searchRestaurants } from '../controllers/public.controllers';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rule 6: Public rate limiter
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { message: 'Too many requests', errorCode: 'RATE_LIMIT_EXCEEDED' } }
});

router.get('/search', searchLimiter, searchRestaurants);
export default router;