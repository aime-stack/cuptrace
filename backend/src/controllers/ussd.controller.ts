/**
 * USSD Controller for CupTrace
 * 
 * Handles USSD requests from Africa's Talking or Twilio.
 * Provides farmers with batch and payment information via USSD.
 */

import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { generatePhoneHash, maskPhone } from '../lib/hashing.js';

// USSD provider from environment
const USSD_PROVIDER = process.env.USSD_PROVIDER || 'at';

/**
 * USSD session state (in-memory for simplicity, use Redis in production)
 */
interface USSDSession {
    phoneHash: string;
    farmerId?: string;
    stage: 'main' | 'batches' | 'batch_status' | 'price' | 'payment';
    data?: Record<string, unknown>;
}

const sessions = new Map<string, USSDSession>();

/**
 * Parse Africa's Talking USSD request
 */
function parseATRequest(body: Record<string, string>) {
    return {
        sessionId: body.sessionId,
        phoneNumber: body.phoneNumber,
        text: body.text || '',
        serviceCode: body.serviceCode,
    };
}

/**
 * Parse Twilio USSD request
 */
function parseTwilioRequest(body: Record<string, string>) {
    return {
        sessionId: body.CallSid || body.SessionId,
        phoneNumber: body.From || body.PhoneNumber,
        text: body.Digits || body.Body || '',
        serviceCode: body.To,
    };
}

/**
 * Format response for Africa's Talking
 */
function formatATResponse(message: string, continueSession: boolean = true): string {
    const prefix = continueSession ? 'CON ' : 'END ';
    return prefix + message;
}

/**
 * Main USSD handler
 * POST /api/ussd
 */
export async function handleUSSD(req: Request, res: Response) {
    try {
        // Parse request based on provider
        const request = USSD_PROVIDER === 'twilio'
            ? parseTwilioRequest(req.body)
            : parseATRequest(req.body);

        const { sessionId, phoneNumber, text } = request;

        // Log (with masked phone for privacy)
        console.log(`USSD Request - Session: ${sessionId}, Phone: ${maskPhone(phoneNumber)}, Text: ${text}`);

        // Get or create session
        let session = sessions.get(sessionId);
        const phoneHash = generatePhoneHash(phoneNumber);

        if (!session) {
            // New session - try to find farmer by phone hash
            const farmer = await prisma.user.findFirst({
                where: { phoneHash },
                select: { id: true, name: true, role: true },
            });

            session = {
                phoneHash,
                farmerId: farmer?.id,
                stage: 'main',
            };
            sessions.set(sessionId, session);

            // If farmer not found
            if (!farmer) {
                const response = formatATResponse(
                    'Welcome to CupTrace.\n\n' +
                    'Your phone number is not registered in our system.\n' +
                    'Please contact your cooperative to register.',
                    false
                );
                res.set('Content-Type', 'text/plain');
                return res.send(response);
            }
        }

        // Process input
        const inputs = text.split('*').filter(Boolean);
        const currentInput = inputs[inputs.length - 1];

        let response: string;

        // Handle menu navigation
        if (text === '') {
            // Main menu
            response = formatATResponse(
                'Welcome to CupTrace\n\n' +
                '1. List my batches\n' +
                '2. Check batch status\n' +
                '3. Check price for batch\n' +
                '4. Payment status\n' +
                '5. Exit'
            );
        } else if (inputs.length === 1) {
            // First level menu selection
            switch (currentInput) {
                case '1':
                    response = await handleListBatches(session);
                    break;
                case '2':
                    response = formatATResponse('Enter batch number (first 8 characters):');
                    session.stage = 'batch_status';
                    break;
                case '3':
                    response = formatATResponse('Enter batch number (first 8 characters):');
                    session.stage = 'price';
                    break;
                case '4':
                    response = await handlePaymentStatus(session);
                    break;
                case '5':
                    response = formatATResponse('Thank you for using CupTrace. Goodbye!', false);
                    sessions.delete(sessionId);
                    break;
                default:
                    response = formatATResponse('Invalid option. Please try again.\n\n1. List batches\n2. Check status\n3. Check price\n4. Payment\n5. Exit');
            }
        } else {
            // Handle sub-menus
            switch (session.stage) {
                case 'batch_status':
                    response = await handleBatchStatus(session, currentInput);
                    break;
                case 'price':
                    response = await handleBatchPrice(session, currentInput);
                    break;
                default:
                    response = formatATResponse('Session expired. Please dial again.', false);
                    sessions.delete(sessionId);
            }
        }

        // Update session
        sessions.set(sessionId, session);

        res.set('Content-Type', 'text/plain');
        return res.send(response);
    } catch (error) {
        console.error('USSD Error:', error);
        res.set('Content-Type', 'text/plain');
        return res.send(formatATResponse('System error. Please try again later.', false));
    }
}

/**
 * Handle "List my batches" option
 */
async function handleListBatches(session: USSDSession): Promise<string> {
    if (!session.farmerId) {
        return formatATResponse('No batches found.', false);
    }

    const batches = await prisma.productBatch.findMany({
        where: { farmerId: session.farmerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            id: true,
            lotId: true,
            status: true,
            quantity: true,
            type: true,
            createdAt: true,
        },
    });

    if (batches.length === 0) {
        return formatATResponse('You have no batches registered.', false);
    }

    let message = 'Your recent batches:\n\n';
    batches.forEach((batch, index) => {
        const shortId = batch.lotId || batch.id.substring(0, 8);
        message += `${index + 1}. ${shortId} - ${batch.status} (${batch.quantity || 0}kg)\n`;
    });

    return formatATResponse(message, false);
}

/**
 * Handle "Check batch status" option
 */
async function handleBatchStatus(session: USSDSession, batchCode: string): Promise<string> {
    if (!session.farmerId) {
        return formatATResponse('Access denied.', false);
    }

    const batch = await prisma.productBatch.findFirst({
        where: {
            farmerId: session.farmerId,
            OR: [
                { id: { startsWith: batchCode } },
                { lotId: { contains: batchCode } },
            ],
        },
        select: {
            id: true,
            lotId: true,
            status: true,
            currentStage: true,
            quantity: true,
            grade: true,
            quality: true,
            nftPolicyId: true,
        },
    });

    if (!batch) {
        return formatATResponse('Batch not found. Please check the code and try again.', false);
    }

    const batchId = batch.lotId || batch.id.substring(0, 8);
    let message = `Batch: ${batchId}\n`;
    message += `Status: ${batch.status}\n`;
    message += `Stage: ${batch.currentStage}\n`;
    message += `Quantity: ${batch.quantity || 0}kg\n`;
    if (batch.grade) message += `Grade: ${batch.grade}\n`;
    if (batch.nftPolicyId) message += `NFT: Minted ✓\n`;

    return formatATResponse(message, false);
}

/**
 * Handle "Check price for batch" option
 */
async function handleBatchPrice(session: USSDSession, batchCode: string): Promise<string> {
    if (!session.farmerId) {
        return formatATResponse('Access denied.', false);
    }

    const batch = await prisma.productBatch.findFirst({
        where: {
            farmerId: session.farmerId,
            OR: [
                { id: { startsWith: batchCode } },
                { lotId: { contains: batchCode } },
            ],
        },
        include: {
            payments: {
                where: { payeeId: session.farmerId },
                select: {
                    amount: true,
                    currency: true,
                    status: true,
                    paymentType: true,
                },
            },
        },
    });

    if (!batch) {
        return formatATResponse('Batch not found.', false);
    }

    const batchId = batch.lotId || batch.id.substring(0, 8);

    if (batch.payments.length === 0) {
        return formatATResponse(`Batch: ${batchId}\n\nNo payment information available yet.`, false);
    }

    let message = `Batch: ${batchId}\n\nPayments:\n`;
    let totalAmount = 0;

    batch.payments.forEach(payment => {
        const amount = Number(payment.amount);
        message += `- ${payment.paymentType}: ${amount} ${payment.currency} (${payment.status})\n`;
        if (payment.status === 'completed') {
            totalAmount += amount;
        }
    });

    message += `\nTotal Received: ${totalAmount} RWF`;

    return formatATResponse(message, false);
}

/**
 * Handle "Payment status" option
 */
async function handlePaymentStatus(session: USSDSession): Promise<string> {
    if (!session.farmerId) {
        return formatATResponse('Access denied.', false);
    }

    const payments = await prisma.payment.findMany({
        where: { payeeId: session.farmerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            amount: true,
            currency: true,
            status: true,
            paymentType: true,
            paymentDate: true,
            batch: {
                select: { lotId: true, id: true },
            },
        },
    });

    if (payments.length === 0) {
        return formatATResponse('No payment records found.', false);
    }

    let message = 'Recent Payments:\n\n';
    payments.forEach((payment, index) => {
        const batchId = payment.batch.lotId || payment.batch.id.substring(0, 6);
        const amount = Number(payment.amount);
        message += `${index + 1}. ${batchId}: ${amount} ${payment.currency}\n   Status: ${payment.status}\n`;
    });

    return formatATResponse(message, false);
}

/**
 * Cleanup expired sessions (call periodically)
 */
export function cleanupSessions() {
    // In a real implementation, track session timestamps and clean up old ones
    // For now, this is a placeholder
    console.log(`Active USSD sessions: ${sessions.size}`);
}

export default {
    handleUSSD,
    cleanupSessions,
};
