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
} from '../controllers/coffee.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
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
} from '../validators/product.validator';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createProductSchema), createCoffeeController);
router.get('/', validate(listProductsSchema), listCoffeeController);
// Specific routes must come before parameterized routes
router.get('/verify/:qrCode', validate(verifyBatchByQRCodeSchema), verifyCoffeeByQRCodeController);
router.get('/lot/:lotId', validate(getProductByLotIdSchema), getCoffeeByLotIdController);
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

