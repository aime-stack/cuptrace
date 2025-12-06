import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { ValidationError } from '../utils/errors';
import crypto from 'crypto';

export const createEventController = async (req: AuthRequest, res: Response) => {
    try {
        const { batchId, eventType, location, description, metadata } = req.body;

        if (!batchId || !eventType) {
            throw new ValidationError('Batch ID and Event Type are required');
        }

        // 1. Calculate Event Hash
        const eventData = {
            batchId,
            eventType,
            operatorId: req.user!.id,
            timestamp: new Date().toISOString(),
            metadata
        };

        const eventHash = crypto
            .createHash('sha256')
            .update(JSON.stringify(eventData))
            .digest('hex');

        // 2. Create Event
        const event = await prisma.supplyChainEvent.create({
            data: {
                batchId,
                eventType,
                operatorId: req.user!.id,
                location,
                description,
                metadata: metadata || {},
                eventHash
            },
            include: {
                operator: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        return sendSuccess(res, event, 201);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return sendError(res, errorMessage);
    }
};

export const listEventsController = async (req: AuthRequest, res: Response) => {
    try {
        const { batchId } = req.params;

        const events = await prisma.supplyChainEvent.findMany({
            where: { batchId },
            orderBy: { timestamp: 'desc' },
            include: {
                operator: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        return sendSuccess(res, events);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return sendError(res, errorMessage);
    }
};
