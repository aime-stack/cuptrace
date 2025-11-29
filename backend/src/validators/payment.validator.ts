import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    payerId: z.string().min(1, 'Payer ID is required'),
    payeeId: z.string().min(1, 'Payee ID is required'),
    amount: z.number()
      .positive('Amount must be positive')
      .refine((val) => val > 0, {
        message: 'Amount must be greater than 0',
      }),
    currency: z.string()
      .length(3, 'Currency must be a 3-letter code (e.g., RWF)')
      .default('RWF')
      .optional(),
    paymentType: z.enum([
      'harvest_payment',
      'processing_payment',
      'export_payment',
      'quality_bonus',
      'other',
    ]),
    paymentDate: z.string().datetime().optional().or(z.date()),
    transactionRef: z.string()
      .max(100, 'Transaction reference must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    notes: z.string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    blockchainTxHash: z.string().optional(),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    amount: z.number()
      .positive('Amount must be positive')
      .optional(),
    currency: z.string()
      .length(3, 'Currency must be a 3-letter code')
      .optional(),
    paymentType: z.enum([
      'harvest_payment',
      'processing_payment',
      'export_payment',
      'quality_bonus',
      'other',
    ]).optional(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
    ]).optional(),
    paymentDate: z.string().datetime().optional().or(z.date()),
    transactionRef: z.string()
      .max(100, 'Transaction reference must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    notes: z.string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    blockchainTxHash: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Payment ID is required'),
  }),
});

export const getPaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Payment ID is required'),
  }),
});

export const deletePaymentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Payment ID is required'),
  }),
});

export const listPaymentsSchema = z.object({
  query: z.object({
    batchId: z.string().optional(),
    payerId: z.string().optional(),
    payeeId: z.string().optional(),
    paymentType: z.enum([
      'harvest_payment',
      'processing_payment',
      'export_payment',
      'quality_bonus',
      'other',
    ]).optional(),
    status: z.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'cancelled',
    ]).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

