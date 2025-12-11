/**
 * Notifications Routes for CupTrace
 */

import { Router } from 'express';
import {
    getNotifications,
    getNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
} from '../controllers/notifications.controller';
import { verifyTokenMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(verifyTokenMiddleware);

/**
 * Get user's notifications
 * GET /notifications
 */
router.get('/', getNotifications);

/**
 * Get unread notification count
 * GET /notifications/count
 */
router.get('/count', getNotificationCount);

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
router.patch('/read-all', markAllNotificationsRead);

/**
 * Mark single notification as read
 * PATCH /notifications/:id/read
 */
router.patch('/:id/read', markNotificationRead);

export default router;
