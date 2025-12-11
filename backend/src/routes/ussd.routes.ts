/**
 * USSD Routes for CupTrace
 * 
 * USSD gateway endpoint for Africa's Talking and Twilio.
 */

import { Router } from 'express';
import { handleUSSD } from '../controllers/ussd.controller';

const router = Router();

/**
 * USSD webhook endpoint (PUBLIC - called by USSD gateway)
 * POST /api/ussd
 */
router.post('/', handleUSSD);

export default router;
