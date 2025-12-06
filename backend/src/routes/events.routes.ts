import { Router } from 'express';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { createEventController, listEventsController } from '../controllers/events.controller';

const router = Router();

router.use(verifyTokenMiddleware);

router.post('/', createEventController);
router.get('/batch/:batchId', listEventsController);

export default router;
