import { Router } from 'express';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';
import { uploadDocumentController, listDocumentsController } from '../controllers/documents.controller';

const router = Router();

router.use(verifyTokenMiddleware);

router.post('/', uploadDocumentController);
router.get('/batch/:batchId', listDocumentsController);

export default router;
