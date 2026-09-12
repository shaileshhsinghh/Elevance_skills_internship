import { Router } from 'express';
import { registerUser } from '../controllers/userregister.controller';

const router = Router({mergeParams: true});

router.post('/registration', registerUser);

export default router;