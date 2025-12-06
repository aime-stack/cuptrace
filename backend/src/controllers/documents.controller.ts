import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { ValidationError } from '../utils/errors';
import crypto from 'crypto';

export const uploadDocumentController = async (req: AuthRequest, res: Response) => {
    try {
        const { batchId, type, url } = req.body;

        if (!batchId || !type || !url) {
            throw new ValidationError('Batch ID, Type, and URL are required');
        }

        // 1. Calculate Document Hash (Mocking content hash for now since we just have URL)
        // In a real app, we would fetch the file and hash its buffer.
        const docHash = crypto
            .createHash('sha256')
            .update(url + new Date().toISOString())
            .digest('hex');

        // 2. Create Document Record
        const document = await prisma.batchDocument.create({
            data: {
                batchId,
                type,
                url,
                hash: docHash,
                uploadedBy: req.user!.id
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        // 3. Log Event
        await prisma.supplyChainEvent.create({
            data: {
                batchId,
                eventType: 'DOCUMENT_UPLOAD',
                operatorId: req.user!.id,
                description: `Document ${type} uploaded`,
                metadata: {
                    documentId: document.id,
                    type,
                    url
                },
                eventHash: docHash
            }
        });

        return sendSuccess(res, document, 201);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return sendError(res, errorMessage);
    }
};

export const listDocumentsController = async (req: AuthRequest, res: Response) => {
    try {
        const { batchId } = req.params;

        const documents = await prisma.batchDocument.findMany({
            where: { batchId },
            orderBy: { createdAt: 'desc' },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        return sendSuccess(res, documents);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return sendError(res, errorMessage);
    }
};
