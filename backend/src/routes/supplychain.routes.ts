import { Router } from 'express';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';
import { transferNFTController } from '../controllers/supplychain.controller.js';

const router = Router();

router.use(verifyTokenMiddleware);

router.post('/transfer-nft', transferNFTController);

export default router;
