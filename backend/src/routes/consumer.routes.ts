import { Router } from 'express';
import * as ConsumerController from '../controllers/consumer.controller';

const router = Router();

// Public endpoints for consumers (no auth required)
router.post('/ratings', ConsumerController.submitRating);
router.post('/donations', ConsumerController.submitDonation);

export default router;
