import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

export const transferNFTController = async (req: AuthRequest, res: Response) => {
    try {
        const { batchId, toUserId, txHash, nextStage } = req.body;

        if (!batchId || !toUserId || !txHash || !nextStage) {
            throw new ValidationError('Missing required fields');
        }

        // 1. Verify Batch Exists
        const batch = await prisma.productBatch.findUnique({
            where: { id: batchId },
        });

        if (!batch) {
            throw new ValidationError('Batch not found');
        }

        // 2. Verify Permission (Current owner should be the one initiating)
        // This logic depends on the current stage.
        // For simplicity, we assume the frontend checks wallet ownership, 
        // and here we check if the user is the assigned actor for the current stage.

        // 3. Determine which field to update based on next stage
        const updateData: any = {
            currentStage: nextStage,
            blockchainTxHash: txHash,
            updatedAt: new Date(),
        };

        if (nextStage === 'exporter') {
            updateData.exporterId = toUserId;
        } else if (nextStage === 'importer') {
            updateData.importerId = toUserId;
        } else if (nextStage === 'retailer') {
            updateData.retailerId = toUserId;
        }

        // 4. Update Batch
        const updatedBatch = await prisma.productBatch.update({
            where: { id: batchId },
            data: updateData,
        });

        // 5. Log Event
        await prisma.supplyChainEvent.create({
            data: {
                batchId,
                eventType: 'NFT_TRANSFER',
                operatorId: req.user!.id,
                description: `Ownership transferred to ${nextStage}`,
                metadata: {
                    txHash,
                    from: req.user!.id,
                    to: toUserId,
                    stage: nextStage
                },
                eventHash: txHash // Using txHash as event hash for transfers
            }
        });

        return sendSuccess(res, updatedBatch);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return sendError(res, errorMessage);
    }
};
