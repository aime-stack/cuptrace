import { z } from 'zod';
import { ProductType, SupplyChainStage } from '@/types';

export const batchSchema = z.object({
    type: z.nativeEnum(ProductType),
    originLocation: z.string().min(2, 'Origin location is required'),
    region: z.string().optional(),
    district: z.string().optional(),
    sector: z.string().optional(),
    cell: z.string().optional(),
    village: z.string().optional(),
    coordinates: z.string().optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    quality: z.string().optional(),
    moisture: z.number().min(0).max(100, 'Moisture must be between 0-100%').optional(),
    harvestDate: z.string().optional(),

    // Coffee-specific
    processingType: z.string().optional(),
    grade: z.string().optional(),

    // Tea-specific
    teaType: z.string().optional(),
    pluckingDate: z.string().optional(),

    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    cooperativeId: z.string().optional(),
    farmerId: z.string().optional(),
});

export const updateBatchSchema = batchSchema.partial().extend({
    status: z.string().optional(),
    currentStage: z.nativeEnum(SupplyChainStage).optional(),
});

export type BatchFormData = z.infer<typeof batchSchema>;
export type UpdateBatchFormData = z.infer<typeof updateBatchSchema>;
