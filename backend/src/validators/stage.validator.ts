import { z } from 'zod';

export const updateStageSchema = z.object({
  body: z.object({
    stage: z.enum([
      'farmer',
      'washing_station',
      'factory',
      'exporter',
      'importer',
      'retailer',
    ]),
    blockchainTxHash: z.string().optional(),
    // Enhanced BatchHistory fields
    notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    quality: z.string().max(100, 'Quality must not exceed 100 characters').optional(),
    location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const updateCoffeeStageSchema = z.object({
  body: z.object({
    stage: z.enum([
      'farmer',
      'washing_station',
      'factory',
      'exporter',
      'importer',
      'retailer',
    ]),
    blockchainTxHash: z.string().optional(),
    // Enhanced BatchHistory fields
    notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    quality: z.string().max(100, 'Quality must not exceed 100 characters').optional(),
    location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const updateTeaStageSchema = z.object({
  body: z.object({
    stage: z.enum([
      'farmer',
      'washing_station',
      'factory',
      'exporter',
      'importer',
      'retailer',
    ]),
    blockchainTxHash: z.string().optional(),
    // Enhanced BatchHistory fields
    notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    quality: z.string().max(100, 'Quality must not exceed 100 characters').optional(),
    location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const getBatchHistorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Batch ID is required'),
  }),
});

