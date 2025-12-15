import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  createProcessingRecord,
  getProcessingRecordById,
  listProcessingRecordsByBatch,
  listProcessingRecords,
  updateProcessingRecord,
  deleteProcessingRecord,
} from '../services/processing.service.js';
import { sendSuccess } from '../utils/response.js';

export const createProcessingRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      batchId,
      stage,
      processingType,
      notes,
      qualityScore,
      quantityIn,
      quantityOut,
      processedBy,
      processedAt,
      blockchainTxHash,
    } = req.body;

    const record = await createProcessingRecord({
      batchId,
      stage,
      processingType,
      notes,
      qualityScore,
      quantityIn,
      quantityOut,
      processedBy,
      processedAt,
      blockchainTxHash,
    });

    return sendSuccess(res, record, 201);
  } catch (error) {
    next(error);
  }
};

export const getProcessingRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const record = await getProcessingRecordById(id);

    return sendSuccess(res, record);
  } catch (error) {
    next(error);
  }
};

export const listProcessingRecordsByBatchController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { batchId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const result = await listProcessingRecordsByBatch(
      batchId,
      parseInt(page as string, 10),
      parseInt(limit as string, 10)
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const listProcessingRecordsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { 
      batchId, 
      stage, 
      page = '1', 
      limit = '10' 
    } = req.query;

    const result = await listProcessingRecords(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      batchId as string | undefined,
      stage as 'farmer' | 'washing_station' | 'factory' | 'exporter' | 'importer' | 'retailer' | undefined
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateProcessingRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      processingType,
      notes,
      qualityScore,
      quantityIn,
      quantityOut,
      blockchainTxHash,
    } = req.body;

    const record = await updateProcessingRecord(id, {
      processingType,
      notes,
      qualityScore,
      quantityIn,
      quantityOut,
      blockchainTxHash,
    });

    return sendSuccess(res, record);
  } catch (error) {
    next(error);
  }
};

export const deleteProcessingRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteProcessingRecord(id);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

