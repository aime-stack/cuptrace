import { z } from 'zod';

// QC Grading Schema for comprehensive quality control assessment
export const qcGradingSchema = z.object({
    // ==========================================
    // Farmer Information
    // ==========================================
    farmerName: z.string().optional(),
    farmLocation: z.string().optional(),
    farmerLotNumber: z.string().optional(),

    // ==========================================
    // Delivery Details
    // ==========================================
    deliveryDateTime: z.string().optional(),
    weightKg: z.coerce.number().positive('Weight must be positive').optional(),
    numberOfBags: z.coerce.number().int().positive('Number of bags must be positive').optional(),

    // ==========================================
    // Cherry Quality Assessment
    // ==========================================
    ripenessLevel: z.enum(['ripe', 'underripe', 'overripe', 'mixed']).optional(),
    defects: z.array(z.enum(['insect_damage', 'mold', 'foreign_matter', 'unripe', 'overfermented'])).optional(),
    floatationTestFloaters: z.coerce.number().min(0).max(100, 'Must be between 0-100%').optional(),
    floatationTestSinkers: z.coerce.number().min(0).max(100, 'Must be between 0-100%').optional(),

    // ==========================================
    // Processing Decisions
    // ==========================================
    processingDecision: z.enum(['accepted', 'rejected']),
    assignedProcessingMethod: z.enum(['washed', 'honey', 'natural', 'pulped_natural']).optional(),
    fermentationTankId: z.string().optional(),
    fermentationLotId: z.string().optional(),
    rejectionReason: z.string().optional(),

    // ==========================================
    // Cupping & Grading
    // ==========================================
    cuppingScore: z.coerce.number().min(0, 'Score must be at least 0').max(100, 'Score must be at most 100'),
    grade: z.string().min(1, 'Grade is required'),
    moisture: z.coerce.number().min(0).max(100, 'Moisture must be between 0-100%').optional(),
    flavorNotes: z.string().optional(), // Comma-separated
    defectsNotes: z.string().optional(),

    // ==========================================
    // Environmental & Operational Checks
    // ==========================================
    waterSourceCondition: z.enum(['clean', 'acceptable', 'needs_attention', 'contaminated']).optional(),
    pulpingMachineStatus: z.enum(['calibrated', 'needs_calibration', 'out_of_service']).optional(),
    tankHygieneStatus: z.enum(['clean', 'acceptable', 'needs_cleaning']).optional(),

    // ==========================================
    // Notes
    // ==========================================
    qcOfficerNotes: z.string().optional(),
}).refine((data) => {
    // Rejection reason is required when rejecting a batch
    if (data.processingDecision === 'rejected' && !data.rejectionReason) {
        return false;
    }
    return true;
}, {
    message: 'Rejection reason is required when rejecting a batch',
    path: ['rejectionReason'],
}).refine((data) => {
    // Floatation test percentages should add up to 100 if both are provided
    if (data.floatationTestFloaters !== undefined && data.floatationTestSinkers !== undefined) {
        const total = data.floatationTestFloaters + data.floatationTestSinkers;
        return Math.abs(total - 100) < 0.01; // Allow for floating point errors
    }
    return true;
}, {
    message: 'Floaters and Sinkers percentages should add up to 100%',
    path: ['floatationTestSinkers'],
});

export type QCGradingFormData = z.infer<typeof qcGradingSchema>;

// Default values for the QC grading form
export const qcGradingDefaultValues: Partial<QCGradingFormData> = {
    cuppingScore: 0,
    grade: '',
    moisture: 0,
    defects: [],
    flavorNotes: '',
    defectsNotes: '',
    qcOfficerNotes: '',
    processingDecision: 'accepted',
    rejectionReason: '',
};
