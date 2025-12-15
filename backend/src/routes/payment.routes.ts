import { Router } from 'express';
import {
  createPaymentController,
  getPaymentController,
  listPaymentsController,
  updatePaymentController,
  deletePaymentController,
} from '../controllers/payment.controller.js';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createPaymentSchema,
  getPaymentSchema,
  listPaymentsSchema,
  updatePaymentSchema,
  deletePaymentSchema,
} from '../validators/payment.validator.js';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createPaymentSchema), createPaymentController);
router.get('/', validate(listPaymentsSchema), listPaymentsController);
router.get('/:id', validate(getPaymentSchema), getPaymentController);
router.put('/:id', validate(updatePaymentSchema), updatePaymentController);
router.delete('/:id', validate(deletePaymentSchema), deletePaymentController);

export default router;

