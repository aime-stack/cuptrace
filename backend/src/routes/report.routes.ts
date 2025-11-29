import { Router } from 'express';
import {
  createReportController,
  getReportController,
  listReportsController,
  updateReportController,
  submitReportController,
  approveReportController,
  rejectReportController,
  deleteReportController,
} from '../controllers/report.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createReportSchema,
  getReportSchema,
  listReportsSchema,
  updateReportSchema,
  submitReportSchema,
  approveReportSchema,
  rejectReportSchema,
  deleteReportSchema,
} from '../validators/report.validator';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createReportSchema), createReportController);
router.get('/', validate(listReportsSchema), listReportsController);
router.get('/:id', validate(getReportSchema), getReportController);
router.put('/:id', validate(updateReportSchema), updateReportController);
router.post('/:id/submit', validate(submitReportSchema), submitReportController);
router.post('/:id/approve', validate(approveReportSchema), approveReportController);
router.post('/:id/reject', validate(rejectReportSchema), rejectReportController);
router.delete('/:id', validate(deleteReportSchema), deleteReportController);

export default router;

