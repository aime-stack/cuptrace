import { Router } from 'express';
import {
  createTeaController,
  getTeaController,
  listTeaController,
  updateTeaController,
  deleteTeaController,
} from '../controllers/tea.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProductSchema,
  getProductSchema,
  updateProductSchema,
  deleteProductSchema,
  listProductsSchema,
} from '../validators/product.validator';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createProductSchema), createTeaController);
router.get('/', validate(listProductsSchema), listTeaController);
router.get('/:id', validate(getProductSchema), getTeaController);
router.put('/:id', validate(updateProductSchema), updateTeaController);
router.delete('/:id', validate(deleteProductSchema), deleteTeaController);

export default router;

