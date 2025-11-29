import { Router } from 'express';
import {
  createCertificateController,
  getCertificateController,
  getCertificateByNumberController,
  listCertificatesByBatchController,
  listCertificatesController,
  updateCertificateController,
  deleteCertificateController,
} from '../controllers/certificate.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createCertificateSchema,
  getCertificateSchema,
  getCertificateByNumberSchema,
  listCertificatesByBatchSchema,
  listCertificatesSchema,
  updateCertificateSchema,
  deleteCertificateSchema,
} from '../validators/certificate.validator';

const router = Router();

// All routes require authentication
router.use(verifyTokenMiddleware);

router.post('/', validate(createCertificateSchema), createCertificateController);
router.get('/', validate(listCertificatesSchema), listCertificatesController);
router.get('/batch/:batchId', validate(listCertificatesByBatchSchema), listCertificatesByBatchController);
router.get('/number/:certificateNumber', validate(getCertificateByNumberSchema), getCertificateByNumberController);
router.get('/:id', validate(getCertificateSchema), getCertificateController);
router.put('/:id', validate(updateCertificateSchema), updateCertificateController);
router.delete('/:id', validate(deleteCertificateSchema), deleteCertificateController);

export default router;

