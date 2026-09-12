import { Router } from 'express';
import { loginUser } from '../controllers/auth.controller';

const router = Router({mergeParams: true});

router.post('/login', loginUser);

export default router;