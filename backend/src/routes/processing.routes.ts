import { Router } from 'express';
import {
  createProcessingRecordController,
  getProcessingRecordController,
  listProcessingRecordsByBatchController,
  listProcessingRecordsController,
  updateProcessingRecordController,
  deleteProcessingRecordController,
} from '../controllers/processing.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProcessingRecordSchema,
  getProcessingRecordSchema,
  listProcessingRecordsByBatchSchema,
  listProcessingRecordsSchema,
  updateProcessingRecordSchema,
  deleteProcessingRecordSchema,
} from '../validators/processing.validator';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createProcessingRecordSchema), createProcessingRecordController);
router.get('/', validate(listProcessingRecordsSchema), listProcessingRecordsController);
router.get('/batch/:batchId', validate(listProcessingRecordsByBatchSchema), listProcessingRecordsByBatchController);
router.get('/:id', validate(getProcessingRecordSchema), getProcessingRecordController);
router.put('/:id', validate(updateProcessingRecordSchema), updateProcessingRecordController);
router.delete('/:id', validate(deleteProcessingRecordSchema), deleteProcessingRecordController);

export default router;

