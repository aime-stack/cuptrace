import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createExportRecord,
  getExportRecordByBatchId,
  getExportRecordById,
  listExportRecords,
  updateExportRecord,
  deleteExportRecord,
} from '../services/export.service';
import { sendSuccess } from '../utils/response';

export const createExportRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      batchId,
      exporterId,
      buyerName,
      buyerAddress,
      buyerEmail,
      shippingMethod,
      shippingDate,
      expectedArrival,
      trackingNumber,
      certificates,
      blockchainTxHash,
    } = req.body;

    const exportRecord = await createExportRecord({
      batchId,
      exporterId,
      buyerName,
      buyerAddress,
      buyerEmail,
      shippingMethod,
      shippingDate,
      expectedArrival,
      trackingNumber,
      certificates,
      blockchainTxHash,
    });

    return sendSuccess(res, exportRecord, 201);
  } catch (error) {
    next(error);
  }
};

export const getExportRecordByBatchController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { batchId } = req.params;

    const exportRecord = await getExportRecordByBatchId(batchId);

    return sendSuccess(res, exportRecord);
  } catch (error) {
    next(error);
  }
};

export const getExportRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const exportRecord = await getExportRecordById(id);

    return sendSuccess(res, exportRecord);
  } catch (error) {
    next(error);
  }
};

export const listExportRecordsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { 
      exporterId, 
      batchId, 
      shippingMethod, 
      page = '1', 
      limit = '10' 
    } = req.query;

    const result = await listExportRecords(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      exporterId as string | undefined,
      batchId as string | undefined,
      shippingMethod as 'air' | 'sea' | 'road' | undefined
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updateExportRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      buyerName,
      buyerAddress,
      buyerEmail,
      shippingMethod,
      shippingDate,
      expectedArrival,
      trackingNumber,
      certificates,
      blockchainTxHash,
    } = req.body;

    const exportRecord = await updateExportRecord(id, {
      buyerName,
      buyerAddress,
      buyerEmail,
      shippingMethod,
      shippingDate,
      expectedArrival,
      trackingNumber,
      certificates,
      blockchainTxHash,
    });

    return sendSuccess(res, exportRecord);
  } catch (error) {
    next(error);
  }
};

export const deleteExportRecordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deleteExportRecord(id);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

