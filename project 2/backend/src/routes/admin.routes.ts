import { Router } from 'express';
import { loginAdmin } from '../controllers/admin.controllers';
import { createRestaurant, updateRestaurant } from '../controllers/restaurant.controllers';

const router = Router();

router.post('/login', loginAdmin);

router.post('/create', createRestaurant);

router.post('/:updateId', updateRestaurant);

export default router;