import { Router } from 'express';
import {
  createTeaController,
  getTeaController,
  listTeaController,
  updateTeaController,
  deleteTeaController,
  approveTeaBatchController,
  rejectTeaBatchController,
  verifyTeaByQRCodeController,
  getTeaByLotIdController,
  retryMintNFTTeaController,
  retryBlockchainRecordTeaController,
} from '../controllers/tea.controller.js';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createProductSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
  listProductsSchema,
  approveBatchSchema,
  rejectBatchSchema,
  verifyBatchByQRCodeSchema,
  getProductByLotIdSchema,
} from '../validators/product.validator.js';

const router = Router();

// All routes require authentication
// Public routes
router.get('/verify/:qrCode', validate(verifyBatchByQRCodeSchema), verifyTeaByQRCodeController);
router.get('/lot/:lotId', validate(getProductByLotIdSchema), getTeaByLotIdController);
router.get('/:id/verify', validate(getProductSchema), getTeaController); // Public access for verification

// Protected routes
router.use(verifyTokenMiddleware);

router.post('/', validate(createProductSchema), createTeaController);
router.get('/', validate(listProductsSchema), listTeaController);
// Parameterized routes
router.get('/:id', validate(getProductSchema), getTeaController);
router.put('/:id', validate(updateProductSchema), updateTeaController);
router.delete('/:id', validate(deleteProductSchema), deleteTeaController);
router.post('/:id/approve', validate(approveBatchSchema), approveTeaBatchController);
router.post('/:id/reject', validate(rejectBatchSchema), rejectTeaBatchController);
// Retry NFT minting for a batch (must come before /:id route)
router.post('/:id/retry-mint-nft', retryMintNFTTeaController);
// Retry blockchain record creation for a batch (must come before /:id route)
router.post('/:id/retry-blockchain', retryBlockchainRecordTeaController);

export default router;

