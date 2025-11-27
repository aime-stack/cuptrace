import { Router } from 'express';
import {
  updateCoffeeStageController,
  updateTeaStageController,
  getBatchHistoryController,
} from '../controllers/stage.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  updateCoffeeStageSchema,
  updateTeaStageSchema,
} from '../validators/stage.validator';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

// Stage update routes
router.put('/coffee/:id', validate(updateCoffeeStageSchema), updateCoffeeStageController);
router.put('/tea/:id', validate(updateTeaStageSchema), updateTeaStageController);

// History route
router.get('/:id/history', getBatchHistoryController);

export default router;

