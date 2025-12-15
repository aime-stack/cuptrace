import { Router } from 'express';
import {
  createExportRecordController,
  getExportRecordByBatchController,
  getExportRecordController,
  listExportRecordsController,
  updateExportRecordController,
  deleteExportRecordController,
} from '../controllers/export.controller.js';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createExportRecordSchema,
  getExportRecordByBatchSchema,
  getExportRecordSchema,
  listExportRecordsSchema,
  updateExportRecordSchema,
  deleteExportRecordSchema,
} from '../validators/export.validator.js';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createExportRecordSchema), createExportRecordController);
router.get('/', validate(listExportRecordsSchema), listExportRecordsController);
router.get('/batch/:batchId', validate(getExportRecordByBatchSchema), getExportRecordByBatchController);
router.get('/:id', validate(getExportRecordSchema), getExportRecordController);
router.put('/:id', validate(updateExportRecordSchema), updateExportRecordController);
router.delete('/:id', validate(deleteExportRecordSchema), deleteExportRecordController);

export default router;

