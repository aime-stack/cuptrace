/**
 * Payment Service
 * Handles payment operations for product batches
 */

import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { sanitizeString, isValidPositiveNumber } from '../utils/validation.js';
import { normalizePagination, createPaginationResult, PaginationResult } from '../utils/pagination.js';
import { parseDate } from '../utils/date.js';

type PaymentType = 'harvest_payment' | 'processing_payment' | 'export_payment' | 'quality_bonus' | 'other';
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface CreatePaymentData {
  batchId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency?: string;
  paymentType: PaymentType;
  paymentDate?: string | Date;
  transactionRef?: string;
  notes?: string;
  blockchainTxHash?: string;
}

export interface UpdatePaymentData {
  amount?: number;
  currency?: string;
  paymentType?: PaymentType;
  status?: PaymentStatus;
  paymentDate?: string | Date;
  transactionRef?: string;
  notes?: string;
  blockchainTxHash?: string;
}

/**
 * Create a new payment
 */
export const createPayment = async (data: CreatePaymentData) => {
  if (!data.batchId) {
    throw new ValidationError('Batch ID is required');
  }

  if (!data.payerId) {
    throw new ValidationError('Payer ID is required');
  }

  if (!data.payeeId) {
    throw new ValidationError('Payee ID is required');
  }

  if (!isValidPositiveNumber(data.amount)) {
    throw new ValidationError('Amount must be a positive number');
  }

  // Validate batch exists
  const batch = await prisma.productBatch.findFirst({
    where: {
      id: data.batchId,
      deletedAt: null,
    },
  });

  if (!batch) {
    throw new NotFoundError('Product batch not found');
  }

  // Validate payer exists
  const payer = await prisma.user.findUnique({
    where: { id: data.payerId },
  });

  if (!payer) {
    throw new NotFoundError('Payer not found');
  }

  // Validate payee exists
  const payee = await prisma.user.findUnique({
    where: { id: data.payeeId },
  });

  if (!payee) {
    throw new NotFoundError('Payee not found');
  }

  // Payer and payee cannot be the same
  if (data.payerId === data.payeeId) {
    throw new ValidationError('Payer and payee cannot be the same');
  }

  const paymentDate = parseDate(data.paymentDate) || null;

  const payment = await prisma.payment.create({
    data: {
      batchId: data.batchId,
      payerId: data.payerId,
      payeeId: data.payeeId,
      amount: data.amount,
      currency: data.currency || 'RWF',
      paymentType: data.paymentType,
      status: 'pending',
      paymentDate,
      transactionRef: sanitizeString(data.transactionRef),
      notes: sanitizeString(data.notes),
      blockchainTxHash: sanitizeString(data.blockchainTxHash),
    },
    include: {
      batch: {
        select: {
          id: true,
          type: true,
          lotId: true,
        },
      },
      payer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      payee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (id: string) => {
  if (!id) {
    throw new ValidationError('Payment ID is required');
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      batch: {
        select: {
          id: true,
          type: true,
          lotId: true,
          currentStage: true,
        },
      },
      payer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      payee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  return payment;
};

/**
 * List payments with pagination and filters
 */
export const listPayments = async (
  page: number = 1,
  limit: number = 10,
  batchId?: string,
  payerId?: string,
  payeeId?: string,
  status?: PaymentStatus,
  paymentType?: PaymentType
): Promise<PaginationResult<unknown>> => {
  const pagination = normalizePagination(page, limit, 1, 10, 100);
  const skip = (pagination.page - 1) * pagination.limit;

  const where: Record<string, unknown> = {};

  if (batchId) {
    where.batchId = batchId;
  }

  if (payerId) {
    where.payerId = payerId;
  }

  if (payeeId) {
    where.payeeId = payeeId;
  }

  if (status) {
    where.status = status;
  }

  if (paymentType) {
    where.paymentType = paymentType;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: pagination.limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        batch: {
          select: {
            id: true,
            type: true,
            lotId: true,
          },
        },
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return createPaginationResult(payments, total, pagination.page, pagination.limit);
};

/**
 * Update payment
 */
export const updatePayment = async (id: string, data: UpdatePaymentData) => {
  if (!id) {
    throw new ValidationError('Payment ID is required');
  }

  const existing = await prisma.payment.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError('Payment not found');
  }

  // Cannot update completed payments
  if (existing.status === 'completed') {
    throw new ValidationError('Cannot update completed payment');
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.amount !== undefined) {
    if (!isValidPositiveNumber(data.amount)) {
      throw new ValidationError('Amount must be a positive number');
    }
    updateData.amount = data.amount;
  }

  if (data.currency !== undefined) {
    updateData.currency = sanitizeString(data.currency) || data.currency;
  }

  if (data.paymentType !== undefined) {
    updateData.paymentType = data.paymentType;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
    
    // If status is completed, set payment date if not already set
    if (data.status === 'completed' && !existing.paymentDate) {
      updateData.paymentDate = new Date();
    }
  }

  if (data.paymentDate !== undefined) {
    const paymentDate = parseDate(data.paymentDate);
    updateData.paymentDate = paymentDate;
  }

  if (data.transactionRef !== undefined) {
    updateData.transactionRef = sanitizeString(data.transactionRef);
  }

  if (data.notes !== undefined) {
    updateData.notes = sanitizeString(data.notes);
  }

  if (data.blockchainTxHash !== undefined) {
    updateData.blockchainTxHash = sanitizeString(data.blockchainTxHash);
  }

  const payment = await prisma.payment.update({
    where: { id },
    data: updateData,
    include: {
      batch: {
        select: {
          id: true,
          type: true,
          lotId: true,
        },
      },
      payer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      payee: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return payment;
};

/**
 * Delete payment
 */
export const deletePayment = async (id: string) => {
  if (!id) {
    throw new ValidationError('Payment ID is required');
  }

  const payment = await prisma.payment.findUnique({
    where: { id },
  });

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Cannot delete completed payments
  if (payment.status === 'completed') {
    throw new ValidationError('Cannot delete completed payment');
  }

  await prisma.payment.delete({
    where: { id },
  });

  return { message: 'Payment deleted successfully' };
};

