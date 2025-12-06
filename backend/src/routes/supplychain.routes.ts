import { Router } from 'express';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { transferNFTController } from '../controllers/supplychain.controller';

const router = Router();

router.use(verifyTokenMiddleware);

router.post('/transfer-nft', transferNFTController);

export default router;
