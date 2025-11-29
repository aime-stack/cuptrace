import { z } from 'zod';

export const createExportRecordSchema = z.object({
  body: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    exporterId: z.string().min(1, 'Exporter ID is required'),
    buyerName: z.string()
      .min(2, 'Buyer name must be at least 2 characters')
      .max(200, 'Buyer name must not exceed 200 characters')
      .trim(),
    buyerAddress: z.string()
      .max(500, 'Buyer address must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    buyerEmail: z.string()
      .email('Invalid buyer email address')
      .toLowerCase()
      .optional()
      .or(z.literal('')),
    shippingMethod: z.enum(['air', 'sea', 'road'], {
      errorMap: () => ({ message: 'Shipping method must be one of: air, sea, road' }),
    }),
    shippingDate: z.string().datetime('Invalid shipping date format').or(z.date()),
    expectedArrival: z.string().datetime('Invalid expected arrival date format').optional().or(z.date()),
    trackingNumber: z.string()
      .max(100, 'Tracking number must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    certificates: z.array(z.string()).optional(),
    blockchainTxHash: z.string().optional(),
  }),
});

export const updateExportRecordSchema = z.object({
  body: z.object({
    buyerName: z.string()
      .min(2, 'Buyer name must be at least 2 characters')
      .max(200, 'Buyer name must not exceed 200 characters')
      .trim()
      .optional(),
    buyerAddress: z.string()
      .max(500, 'Buyer address must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    buyerEmail: z.string()
      .email('Invalid buyer email address')
      .toLowerCase()
      .optional()
      .or(z.literal('')),
    shippingMethod: z.enum(['air', 'sea', 'road']).optional(),
    shippingDate: z.string().datetime('Invalid shipping date format').optional().or(z.date()),
    expectedArrival: z.string().datetime('Invalid expected arrival date format').optional().or(z.date()),
    trackingNumber: z.string()
      .max(100, 'Tracking number must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    certificates: z.array(z.string()).optional(),
    blockchainTxHash: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Export record ID is required'),
  }),
});

export const getExportRecordSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Export record ID is required'),
  }),
});

export const getExportRecordByBatchSchema = z.object({
  params: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
  }),
});

export const deleteExportRecordSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Export record ID is required'),
  }),
});

export const listExportRecordsSchema = z.object({
  query: z.object({
    exporterId: z.string().optional(),
    batchId: z.string().optional(),
    shippingMethod: z.enum(['air', 'sea', 'road']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

