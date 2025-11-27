import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    type: z.enum(['coffee', 'tea']),
    originLocation: z.string().min(1, 'Origin location is required'),
    farmerId: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    originLocation: z.string().min(1).optional(),
    farmerId: z.string().optional(),
    washingStationId: z.string().optional(),
    factoryId: z.string().optional(),
    exporterId: z.string().optional(),
    importerId: z.string().optional(),
    retailerId: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const listProductsSchema = z.object({
  query: z.object({
    type: z.enum(['coffee', 'tea']).optional(),
    stage: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

