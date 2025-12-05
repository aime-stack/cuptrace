import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useBatches } from '@/hooks/useBatches';
import { useCurrentUser } from '@/hooks/useAuth';
import * as processingService from '@/services/processing.service';
import { ProductType } from '@/types';

/**
 * Washing Station-specific hooks
 */
export const useWSBatches = () => {
    const { data: user } = useCurrentUser();
    return useBatches({ washingStationId: user?.id }, ProductType.coffee);
};

export const useWSProcessingRecords = (batchId?: string) => {
    const { data: user } = useCurrentUser();
    return useQuery({
        queryKey: ['ws', 'processing-records', batchId, user?.id],
        queryFn: async () => {
            if (batchId) {
                const { listProcessingRecordsByBatch } = await import('@/services/processing.service');
                return listProcessingRecordsByBatch(batchId);
            }
            return processingService.listProcessingRecords(1, 10, undefined, 'washing_station');
        },
        enabled: !!user?.id,
    });
};

export const useWSCreateProcessingRecord = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => processingService.createProcessingRecord(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ws', 'processing-records'] });
            toast.success('Processing record created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create processing record');
        },
    });
};

