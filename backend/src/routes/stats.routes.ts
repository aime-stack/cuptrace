import { Router } from 'express';
import { getDashboardStats, getFarmerStats, getWashingStationStats, getFactoryStats, getAgentStats } from '../controllers/stats.controller';
import { verifyTokenMiddleware, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', verifyTokenMiddleware, authorize(['admin']), getDashboardStats);
router.get('/farmer', verifyTokenMiddleware, authorize(['farmer']), getFarmerStats);
router.get('/washing-station', verifyTokenMiddleware, authorize(['washing_station']), getWashingStationStats);
router.get('/factory', verifyTokenMiddleware, authorize(['factory', 'admin', 'qc']), getFactoryStats);
router.get('/agent', verifyTokenMiddleware, authorize(['agent']), getAgentStats);

export default router;
