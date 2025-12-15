import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { updateBatchStage, getBatchHistory } from '../services/stage.service.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';
import prisma from '../config/database.js';

export const updateCoffeeStageController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { stage, blockchainTxHash, notes, quantity, quality, location, metadata } = req.body;

    if (!req.user) {
      throw new Error('User not authenticated');
    }

    // Verify it's a coffee batch
    const batch = await prisma.productBatch.findFirst({
      where: {
        id,
        type: 'coffee',
        deletedAt: null,
      },
    });

    if (!batch) {
      throw new NotFoundError('Coffee batch not found');
    }

    const updatedBatch = await updateBatchStage(id, {
      stage,
      blockchainTxHash,
      changedBy: req.user.id,
      notes,
      quantity,
      quality,
      location,
      metadata,
    });

    return sendSuccess(res, updatedBatch);
  } catch (error) {
    next(error);
  }
};

export const updateTeaStageController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { stage, blockchainTxHash, notes, quantity, quality, location, metadata } = req.body;

    if (!req.user) {
      throw new Error('User not authenticated');
    }

    // Verify it's a tea batch
    const batch = await prisma.productBatch.findFirst({
      where: {
        id,
        type: 'tea',
        deletedAt: null,
      },
    });

    if (!batch) {
      throw new NotFoundError('Tea batch not found');
    }

    const updatedBatch = await updateBatchStage(id, {
      stage,
      blockchainTxHash,
      changedBy: req.user.id,
      notes,
      quantity,
      quality,
      location,
      metadata,
    });

    return sendSuccess(res, updatedBatch);
  } catch (error) {
    next(error);
  }
};

export const getBatchHistoryController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const history = await getBatchHistory(id);

    return sendSuccess(res, history);
  } catch (error) {
    next(error);
  }
};

