import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    type: z.enum(['coffee', 'tea']),
    originLocation: z.string().min(1, 'Origin location is required'),
    farmerId: z.string().optional(),
    cooperativeId: z.string().optional(),
    // Location fields
    region: z.string().optional(),
    district: z.string().optional(),
    sector: z.string().optional(),
    cell: z.string().optional(),
    village: z.string().optional(),
    coordinates: z.string().optional(),
    // Product attributes
    lotId: z.string().optional(),
    quantity: z.number().positive().optional(),
    quality: z.string().optional(),
    moisture: z.number().min(0).max(100).optional(),
    harvestDate: z.string().optional(),
    pluckingDate: z.string().optional(),
    // Coffee-specific
    processingType: z.string().optional(),
    grade: z.string().optional(),
    // Tea-specific
    teaType: z.string().optional(),
    // Metadata
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
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
    cooperativeId: z.string().optional(),
    // Location fields
    region: z.string().optional(),
    district: z.string().optional(),
    sector: z.string().optional(),
    cell: z.string().optional(),
    village: z.string().optional(),
    coordinates: z.string().optional(),
    // Product attributes
    lotId: z.string().optional(),
    quantity: z.number().positive().optional(),
    quality: z.string().optional(),
    moisture: z.number().min(0).max(100).optional(),
    harvestDate: z.string().optional(),
    pluckingDate: z.string().optional(),
    // Coffee-specific
    processingType: z.string().optional(),
    grade: z.string().optional(),
    // Tea-specific
    teaType: z.string().optional(),
    // Status
    status: z.enum(['pending', 'approved', 'rejected', 'in_transit', 'completed']).optional(),
    // Metadata
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
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

