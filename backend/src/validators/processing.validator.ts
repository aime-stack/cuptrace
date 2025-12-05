import { z } from 'zod';

export const createProcessingRecordSchema = z.object({
  body: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    stage: z.enum([
      'farmer',
      'washing_station',
      'factory',
      'exporter',
      'importer',
      'retailer',
    ]),
    processingType: z.string()
      .min(1, 'Processing type is required')
      .max(100, 'Processing type must not exceed 100 characters')
      .trim(),
    notes: z.string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional()
      .or(z.literal('')),
    qualityScore: z.number()
      .min(0, 'Quality score must be at least 0')
      .max(100, 'Quality score must not exceed 100')
      .optional(),
    quantityIn: z.number()
      .positive('Input quantity must be positive')
      .optional(),
    quantityOut: z.number()
      .positive('Output quantity must be positive')
      .optional(),
    processedBy: z.string().min(1, 'Processed by user ID is required'),
    processedAt: z.string().datetime().optional().or(z.date()),
    blockchainTxHash: z.string().optional(),
  }),
});

export const updateProcessingRecordSchema = z.object({
  body: z.object({
    processingType: z.string()
      .min(1, 'Processing type is required')
      .max(100, 'Processing type must not exceed 100 characters')
      .trim()
      .optional(),
    notes: z.string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional()
      .or(z.literal('')),
    qualityScore: z.number()
      .min(0, 'Quality score must be at least 0')
      .max(100, 'Quality score must not exceed 100')
      .optional(),
    quantityIn: z.number()
      .positive('Input quantity must be positive')
      .optional(),
    quantityOut: z.number()
      .positive('Output quantity must be positive')
      .optional(),
    blockchainTxHash: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Processing record ID is required'),
  }),
});

export const getProcessingRecordSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Processing record ID is required'),
  }),
});

export const deleteProcessingRecordSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Processing record ID is required'),
  }),
});

export const listProcessingRecordsSchema = z.object({
  query: z.object({
    batchId: z.string().optional(),
    stage: z.enum([
      'farmer',
      'washing_station',
      'factory',
      'exporter',
      'importer',
      'retailer',
    ]).optional(),
    processedBy: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const listProcessingRecordsByBatchSchema = z.object({
  params: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
  }),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

