import { Router } from 'express';
import { verifyTokenMiddleware } from '../middleware/auth.middleware.js';
import { uploadDocumentController, listDocumentsController } from '../controllers/documents.controller.js';

const router = Router();

router.use(verifyTokenMiddleware);

router.post('/', uploadDocumentController);
router.get('/batch/:batchId', listDocumentsController);

export default router;
