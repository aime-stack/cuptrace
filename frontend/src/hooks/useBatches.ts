import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as batchService from '@/services/batch.service';
import { CreateBatchRequest, UpdateBatchRequest, BatchFilters, ProductType } from '@/types';

/**
 * List batches query
 */
export const useBatches = (filters?: BatchFilters, type: ProductType = ProductType.coffee, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['batches', type, filters],
        queryFn: () => batchService.listBatches(filters, type),
        enabled: options?.enabled,
        staleTime: 60000, // 1 minute cache
    });
};

/**
 * Get single batch query
 */
export const useBatch = (id: string, type: ProductType = ProductType.coffee) => {
    return useQuery({
        queryKey: ['batch', id, type],
        queryFn: () => batchService.getBatch(id, type),
        enabled: !!id,
    });
};

/**
 * Create batch mutation
 */
export const useCreateBatch = (type: ProductType = ProductType.coffee) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBatchRequest) => batchService.createBatch(data, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            toast.success('Batch created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create batch');
        },
    });
};

/**
 * Update batch mutation
 */
export const useUpdateBatch = (type: ProductType = ProductType.coffee) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateBatchRequest }) =>
            batchService.updateBatch(id, data, type),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['batch', variables.id] });
            toast.success('Batch updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update batch');
        },
    });
};

/**
 * Delete batch mutation
 */
export const useDeleteBatch = (type: ProductType = ProductType.coffee) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => batchService.deleteBatch(id, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            toast.success('Batch deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete batch');
        },
    });
};

/**
 * Approve batch mutation
 */
export const useApproveBatch = (type: ProductType = ProductType.coffee) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => batchService.approveBatch(id, type),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['batch', id] });
            toast.success('Batch approved successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to approve batch');
        },
    });
};

/**
 * Reject batch mutation
 */
export const useRejectBatch = (type: ProductType = ProductType.coffee) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            batchService.rejectBatch(id, reason, type),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['batch', variables.id] });
            toast.success('Batch rejected');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to reject batch');
        },
    });
};

/**
 * Verify batch by QR code query
 */
/**
 * Verify batch by QR code or Lot ID query (Smart Search)
 * Searches both Coffee and Tea databases if type is not specified
 */
export const useVerifyBatch = (qrCode: string, type?: ProductType) => {
    return useQuery({
        queryKey: ['verifyBatch', qrCode, type],
        queryFn: async () => {
            // Helper to try fetching a batch
            const tryFetch = async (t: ProductType) => {
                // First try by Lot ID
                try {
                    return await batchService.getBatchByLotId(qrCode, t);
                } catch {
                    // Then try by QR Code/Hash
                    try {
                        return await batchService.verifyBatchByQRCode(qrCode, t);
                    } catch {
                        // Finally try by UUID (if user pasted a raw ID)
                        return await batchService.verifyBatchById(qrCode, t);
                    }
                }
            };

            // If a specific type is provided, just search that
            if (type) {
                return await tryFetch(type);
            }

            // Otherwise, search both concurrently and return the first success
            try {
                return await Promise.any([
                    tryFetch(ProductType.coffee),
                    tryFetch(ProductType.tea)
                ]);
            } catch (error) {
                throw new Error("Batch not found in any database");
            }
        },
        enabled: !!qrCode,
        retry: false,
    });
};

/**
 * Get batch by lot ID query
 */
export const useBatchByLotId = (lotId: string, type: ProductType = ProductType.coffee) => {
    return useQuery({
        queryKey: ['batchByLotId', lotId, type],
        queryFn: () => batchService.getBatchByLotId(lotId, type),
        enabled: !!lotId,
    });
};
