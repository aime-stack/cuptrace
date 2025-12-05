import * as processingService from '@/services/processing.service';
import * as batchService from '@/services/batch.service';

/**
 * Washing Station-specific service methods
 */
export const washingStationService = {
    /**
     * Processing records
     */
    processing: {
        list: (batchId?: string) => {
            if (batchId) {
                return processingService.listProcessingRecordsByBatch(batchId);
            }
            return processingService.listProcessingRecords(1, 10, undefined, 'washing_station');
        },
        create: (data: any) => processingService.createProcessingRecord(data),
    },

    /**
     * Batch operations
     */
    batches: {
        updateStage: (id: string, stage: string, data: any) => {
            // TODO: Implement stage update
            return Promise.resolve({});
        },
    },
};

