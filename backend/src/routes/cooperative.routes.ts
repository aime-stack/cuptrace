import { Router } from 'express';
import {
  createCooperativeController,
  getCooperativeController,
  listCooperativesController,
  updateCooperativeController,
  deleteCooperativeController,
} from '../controllers/cooperative.controller.js';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createCooperativeSchema,
  getCooperativeSchema,
  listCooperativesSchema,
  updateCooperativeSchema,
  deleteCooperativeSchema,
} from '../validators/cooperative.validator.js';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createCooperativeSchema), createCooperativeController);
router.get('/', validate(listCooperativesSchema), listCooperativesController);
router.get('/:id', validate(getCooperativeSchema), getCooperativeController);
router.put('/:id', validate(updateCooperativeSchema), updateCooperativeController);
router.delete('/:id', validate(deleteCooperativeSchema), deleteCooperativeController);

export default router;

