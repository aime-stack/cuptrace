/**
 * Notifications Controller for CupTrace
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from '../services/notifications.service';

/**
 * Get current user's notifications
 * GET /notifications
 */
export async function getNotifications(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const limit = parseInt(req.query.limit as string) || 20;
        const unreadOnly = req.query.unread === 'true';

        const notifications = await getUserNotifications(userId, limit, unreadOnly);
        const unreadCount = await getUnreadCount(userId);

        return res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount,
            },
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch notifications',
        });
    }
}

/**
 * Get unread notification count
 * GET /notifications/count
 */
export async function getNotificationCount(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const unreadCount = await getUnreadCount(userId);

        return res.status(200).json({
            success: true,
            data: { unreadCount },
        });
    } catch (error) {
        console.error('Error fetching notification count:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch notification count',
        });
    }
}

/**
 * Mark single notification as read
 * PATCH /notifications/:id/read
 */
export async function markNotificationRead(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // TODO: Verify notification belongs to user
        await markAsRead(id);

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read',
        });
    }
}

/**
 * Mark all notifications as read
 * PATCH /notifications/read-all
 */
export async function markAllNotificationsRead(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const count = await markAllAsRead(userId);

        return res.status(200).json({
            success: true,
            message: `${count} notifications marked as read`,
            data: { count },
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to mark notifications as read',
        });
    }
}

export default {
    getNotifications,
    getNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
};
