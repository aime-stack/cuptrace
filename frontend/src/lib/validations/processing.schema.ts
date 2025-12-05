import { z } from 'zod';
import { SupplyChainStage } from '@/types';

export const processingRecordSchema = z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    stage: z.nativeEnum(SupplyChainStage),
    processingType: z.string().min(2, 'Processing type is required'),
    notes: z.string().optional(),
    qualityScore: z.number().min(0).max(100).optional(),
    quantityIn: z.number().positive().optional(),
    quantityOut: z.number().positive().optional(),
});

export type ProcessingRecordFormData = z.infer<typeof processingRecordSchema>;
