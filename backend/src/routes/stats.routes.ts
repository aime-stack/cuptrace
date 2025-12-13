import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller';
import { verifyTokenMiddleware, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', verifyTokenMiddleware, authorize(['admin']), getDashboardStats);

export default router;
