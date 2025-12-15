import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import {
  createPayment,
  getPaymentById,
  listPayments,
  updatePayment,
  deletePayment,
} from '../services/payment.service.js';
import { sendSuccess } from '../utils/response.js';

export const createPaymentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const {
      batchId,
      payerId,
      payeeId,
      amount,
      currency,
      paymentType,
      paymentDate,
      transactionRef,
      notes,
      blockchainTxHash,
    } = req.body;

    const payment = await createPayment({
      batchId,
      payerId,
      payeeId,
      amount,
      currency,
      paymentType,
      paymentDate,
      transactionRef,
      notes,
      blockchainTxHash,
    });

    return sendSuccess(res, payment, 201);
  } catch (error) {
    next(error);
  }
};

export const getPaymentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const payment = await getPaymentById(id);

    return sendSuccess(res, payment);
  } catch (error) {
    next(error);
  }
};

export const listPaymentsController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { 
      batchId, 
      payerId, 
      payeeId, 
      paymentType, 
      status, 
      page = '1', 
      limit = '10' 
    } = req.query;

    const result = await listPayments(
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      batchId as string | undefined,
      payerId as string | undefined,
      payeeId as string | undefined,
      status as 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | undefined,
      paymentType as 'harvest_payment' | 'processing_payment' | 'export_payment' | 'quality_bonus' | 'other' | undefined
    );

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const {
      amount,
      currency,
      paymentType,
      status,
      paymentDate,
      transactionRef,
      notes,
      blockchainTxHash,
    } = req.body;

    const payment = await updatePayment(id, {
      amount,
      currency,
      paymentType,
      status,
      paymentDate,
      transactionRef,
      notes,
      blockchainTxHash,
    });

    return sendSuccess(res, payment);
  } catch (error) {
    next(error);
  }
};

export const deletePaymentController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    const result = await deletePayment(id);

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

