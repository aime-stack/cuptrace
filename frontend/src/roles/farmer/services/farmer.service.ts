import * as batchService from '@/services/batch.service';
import * as paymentService from '@/services/payment.service';
import { CreateBatchRequest, ProductType } from '@/types';

/**
 * Farmer-specific service methods
 */
export const farmerService = {
    /**
     * Create a new batch (farmer-specific wrapper)
     */
    createBatch: (data: CreateBatchRequest, type: ProductType = ProductType.coffee) => {
        return batchService.createBatch(data, type);
    },

    /**
     * Get farmer's payments
     */
    getPayments: () => {
        return paymentService.listPayments();
    },
};

