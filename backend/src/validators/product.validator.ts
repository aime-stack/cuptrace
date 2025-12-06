import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    type: z.enum(['coffee', 'tea']).optional(), // Optional - set by route
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
    metadata: z.record(z.unknown()).optional(),
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
    metadata: z.record(z.unknown()).optional(),
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
    stage: z.enum(['farmer', 'washing_station', 'factory', 'exporter', 'importer', 'retailer']).optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'in_transit', 'completed']).optional(),
    farmerId: z.string().optional(),
    cooperativeId: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const approveBatchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Batch ID is required'),
  }),
});

export const rejectBatchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Batch ID is required'),
  }),
  body: z.object({
    reason: z.string().max(500, 'Reason must not exceed 500 characters').optional(),
  }),
});

export const verifyBatchByQRCodeSchema = z.object({
  params: z.object({
    qrCode: z.string().min(1, 'QR code is required'),
  }),
});

export const getProductByLotIdSchema = z.object({
  params: z.object({
    lotId: z.string().min(1, 'Lot ID is required'),
  }),
});

