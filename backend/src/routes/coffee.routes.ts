import { Router } from 'express';
import {
  createCoffeeController,
  getCoffeeController,
  listCoffeeController,
  updateCoffeeController,
  deleteCoffeeController,
  approveCoffeeBatchController,
  rejectCoffeeBatchController,
  verifyCoffeeByQRCodeController,
  getCoffeeByLotIdController,
  retryMintNFTCoffeeController,
  retryBlockchainRecordCoffeeController,
} from '../controllers/coffee.controller.js';
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
// Public routes
router.get('/verify/:qrCode', validate(verifyBatchByQRCodeSchema), verifyCoffeeByQRCodeController);
router.get('/lot/:lotId', validate(getProductByLotIdSchema), getCoffeeByLotIdController);
router.get('/:id/verify', validate(getProductSchema), getCoffeeController); // Public access for verification

// Protected routes
router.use(verifyTokenMiddleware);

router.post('/', validate(createProductSchema), createCoffeeController);
router.get('/', validate(listProductsSchema), listCoffeeController);

// Parameterized routes
router.get('/:id', validate(getProductSchema), getCoffeeController);
router.put('/:id', validate(updateProductSchema), updateCoffeeController);
router.delete('/:id', validate(deleteProductSchema), deleteCoffeeController);
router.post('/:id/approve', validate(approveBatchSchema), approveCoffeeBatchController);
router.post('/:id/reject', validate(rejectBatchSchema), rejectCoffeeBatchController);
// Retry NFT minting for a batch (must come before /:id route)
router.post('/:id/retry-mint-nft', retryMintNFTCoffeeController);
// Retry blockchain record creation for a batch (must come before /:id route)
router.post('/:id/retry-blockchain', retryBlockchainRecordCoffeeController);

export default router;

