/**
 * QR Code Routes for CupTrace
 * 
 * Routes for QR code generation and public trace access.
 */

import { Router } from 'express';
import { generateQR, getPublicTrace, verifyByCode } from '../controllers/qr.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * Generate QR code for a batch (requires authentication)
 * POST /api/batches/:id/generate-qr
 */
router.post('/batches/:id/generate-qr', verifyTokenMiddleware, generateQR);

/**
 * Get public trace information (PUBLIC - no auth required)
 * GET /api/trace/:publicHash
 */
router.get('/trace/:publicHash', getPublicTrace);

/**
 * Verify by QR code or lot ID (PUBLIC - no auth required)
 * GET /api/verify-code/:code
 */
router.get('/verify-code/:code', verifyByCode);

export default router;
