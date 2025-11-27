import { Router } from 'express';
import {
  createCoffeeController,
  getCoffeeController,
  listCoffeeController,
  updateCoffeeController,
  deleteCoffeeController,
} from '../controllers/coffee.controller';
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

router.post('/', validate(createProductSchema), createCoffeeController);
router.get('/', validate(listProductsSchema), listCoffeeController);
router.get('/:id', validate(getProductSchema), getCoffeeController);
router.put('/:id', validate(updateProductSchema), updateCoffeeController);
router.delete('/:id', validate(deleteProductSchema), deleteCoffeeController);

export default router;

