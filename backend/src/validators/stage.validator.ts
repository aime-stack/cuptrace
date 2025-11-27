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
  }),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

