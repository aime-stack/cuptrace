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
} from '../controllers/tea.controller';
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

router.post('/', validate(createProductSchema), createTeaController);
router.get('/', validate(listProductsSchema), listTeaController);
// Specific routes must come before parameterized routes
router.get('/verify/:qrCode', validate(verifyBatchByQRCodeSchema), verifyTeaByQRCodeController);
router.get('/lot/:lotId', validate(getProductByLotIdSchema), getTeaByLotIdController);
// Parameterized routes
router.get('/:id', validate(getProductSchema), getTeaController);
router.put('/:id', validate(updateProductSchema), updateTeaController);
router.delete('/:id', validate(deleteProductSchema), deleteTeaController);
router.post('/:id/approve', validate(approveBatchSchema), approveTeaBatchController);
router.post('/:id/reject', validate(rejectBatchSchema), rejectTeaBatchController);

export default router;

