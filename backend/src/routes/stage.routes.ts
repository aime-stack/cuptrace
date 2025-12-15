import { Router } from 'express';
import {
  updateCoffeeStageController,
  updateTeaStageController,
  getBatchHistoryController,
} from '../controllers/stage.controller.js';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  updateCoffeeStageSchema,
  updateTeaStageSchema,
  getBatchHistorySchema,
} from '../validators/stage.validator.js';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// Stage update routes
router.put('/coffee/:id', validate(updateCoffeeStageSchema), updateCoffeeStageController);
router.put('/tea/:id', validate(updateTeaStageSchema), updateTeaStageController);

// History route
router.get('/:id/history', validate(getBatchHistorySchema), getBatchHistoryController);

export default router;

