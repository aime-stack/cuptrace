/**
 * Notification Service for CupTrace
 * 
 * Handles in-app notifications, SMS (Africa's Talking), and email notifications.
 */

import prisma from '../config/database';
import { maskPhone } from '../lib/hashing';

// Africa's Talking SDK
let AfricasTalking: any = null;
try {
    AfricasTalking = require('africastalking');
} catch (e) {
    console.warn('africastalking package not installed, SMS notifications will be disabled');
}

// Initialize Africa's Talking client
const getATClient = () => {
    const username = process.env.AT_USERNAME;
    const apiKey = process.env.AT_API_KEY;

    if (!username || !apiKey || !AfricasTalking) {
        return null;
    }

    return AfricasTalking({
        username,
        apiKey,
    });
};

// Notification types
export enum NotificationType {
    BATCH_APPROVED = 'batch_approved',
    BATCH_REJECTED = 'batch_rejected',
    QR_GENERATED = 'qr_generated',
    PAYMENT_RECEIVED = 'payment_received',
    NFT_MINTED = 'nft_minted',
}

// Notification data interface
export interface NotificationData {
    batchId?: string;
    lotId?: string;
    grade?: string;
    quality?: string;
    cuppingScore?: number;
    qrCodeUrl?: string;
    traceUrl?: string;
    nftPolicyId?: string;
    paymentAmount?: number;
    paymentCurrency?: string;
    [key: string]: unknown;
}

/**
 * Create an in-app notification
 */
export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: NotificationData
): Promise<{ id: string }> {
    const notification = await prisma.notification.create({
        data: {
            userId,
            type,
            title,
            message,
            data: data || {},
        },
    });

    console.log(`[Notification] Created for user ${userId}: ${type}`);
    return { id: notification.id };
}

/**
 * Send SMS notification via Africa's Talking
 */
export async function sendSMS(
    phoneNumber: string,
    message: string
): Promise<{ success: boolean; error?: string }> {
    const client = getATClient();

    if (!client) {
        console.warn('[SMS] Africa\'s Talking not configured, skipping SMS');
        return { success: false, error: 'SMS not configured' };
    }

    try {
        const sms = client.SMS;
        const result = await sms.send({
            to: [phoneNumber],
            message,
            // from: process.env.AT_SHORTCODE, // Optional shortcode
        });

        console.log(`[SMS] Sent to ${maskPhone(phoneNumber)}: ${result.SMSMessageData?.Recipients?.[0]?.status}`);
        return { success: true };
    } catch (error) {
        console.error('[SMS] Failed to send:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Send batch approved notification (in-app + SMS)
 */
export async function sendBatchApprovedNotification(
    batchId: string,
    includesSMS: boolean = true
): Promise<{ notificationId: string; smsSent: boolean }> {
    // Get batch with farmer details
    const batch = await prisma.productBatch.findUnique({
        where: { id: batchId },
        include: {
            farmer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
        },
    });

    if (!batch || !batch.farmer) {
        throw new Error('Batch or farmer not found');
    }

    const farmer = batch.farmer;
    const lotId = batch.lotId || batch.id.substring(0, 8);

    // Build notification data
    const data: NotificationData = {
        batchId: batch.id,
        lotId,
        grade: batch.grade || undefined,
        quality: batch.quality || undefined,
        qrCodeUrl: batch.qrCodeUrl || undefined,
        traceUrl: batch.publicTraceHash
            ? `${process.env.FRONTEND_HOST || 'http://localhost:3000'}/trace/${batch.publicTraceHash}`
            : undefined,
        nftPolicyId: batch.nftPolicyId || undefined,
    };

    // Create in-app notification
    const title = `Batch ${lotId} Approved!`;
    const message = `Your coffee batch has been approved by Quality Control.` +
        (batch.grade ? ` Grade: ${batch.grade}.` : '') +
        (batch.qrCodeUrl ? ` QR code is ready for tracking.` : '');

    const notification = await createNotification(
        farmer.id,
        NotificationType.BATCH_APPROVED,
        title,
        message,
        data
    );

    // Send SMS if configured and phone available
    let smsSent = false;
    if (includesSMS && farmer.phone) {
        const smsMessage = `CupTrace: Your batch ${lotId} is APPROVED!` +
            (batch.grade ? ` Grade: ${batch.grade}.` : '') +
            ` Track: ${data.traceUrl || 'cuptrace.rw'}`;

        const smsResult = await sendSMS(farmer.phone, smsMessage);
        smsSent = smsResult.success;

        // Update notification with SMS status
        await prisma.notification.update({
            where: { id: notification.id },
            data: { smsSent },
        });
    }

    return { notificationId: notification.id, smsSent };
}

/**
 * Send QR generated notification
 */
export async function sendQRGeneratedNotification(
    batchId: string,
    qrCodeUrl: string,
    traceUrl: string
): Promise<{ notificationId: string }> {
    const batch = await prisma.productBatch.findUnique({
        where: { id: batchId },
        include: {
            farmer: {
                select: { id: true, name: true },
            },
        },
    });

    if (!batch || !batch.farmer) {
        throw new Error('Batch or farmer not found');
    }

    const lotId = batch.lotId || batch.id.substring(0, 8);

    const notification = await createNotification(
        batch.farmer.id,
        NotificationType.QR_GENERATED,
        `QR Code Ready for ${lotId}`,
        `Your batch QR code is ready. Consumers can now scan to verify authenticity.`,
        {
            batchId: batch.id,
            lotId,
            qrCodeUrl,
            traceUrl,
        }
    );

    return { notificationId: notification.id };
}

/**
 * Get user's notifications
 */
export async function getUserNotifications(
    userId: string,
    limit: number = 20,
    unreadOnly: boolean = false
): Promise<Notification[]> {
    interface Notification {
        id: string;
        type: string;
        title: string;
        message: string;
        data: unknown;
        isRead: boolean;
        createdAt: Date;
        readAt: Date | null;
    }

    return prisma.notification.findMany({
        where: {
            userId,
            ...(unreadOnly ? { isRead: false } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    }) as unknown as Notification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
        where: {
            userId,
            isRead: false,
        },
    });
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
        where: { id: notificationId },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });
}

/**
 * Mark all user's notifications as read
 */
export async function markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
            readAt: new Date(),
        },
    });

    return result.count;
}

export default {
    createNotification,
    sendSMS,
    sendBatchApprovedNotification,
    sendQRGeneratedNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    NotificationType,
};
