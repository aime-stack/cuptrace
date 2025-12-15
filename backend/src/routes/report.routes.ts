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
  generateNaebReportController,
} from '../controllers/report.controller.js';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createReportSchema,
  getReportSchema,
  listReportsSchema,
  updateReportSchema,
  submitReportSchema,
  approveReportSchema,
  rejectReportSchema,
  deleteReportSchema,
  generateNaebReportSchema,
} from '../validators/report.validator.js';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createReportSchema), createReportController);
router.get('/', validate(listReportsSchema), listReportsController);
// Specific route must come before parameterized route
router.get('/naeb', validate(generateNaebReportSchema), generateNaebReportController);
router.get('/:id', validate(getReportSchema), getReportController);
router.put('/:id', validate(updateReportSchema), updateReportController);
router.post('/:id/submit', validate(submitReportSchema), submitReportController);
router.post('/:id/approve', validate(approveReportSchema), approveReportController);
router.post('/:id/reject', validate(rejectReportSchema), rejectReportController);
router.delete('/:id', validate(deleteReportSchema), deleteReportController);

export default router;

