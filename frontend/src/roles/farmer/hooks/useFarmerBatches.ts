import { useBatches, useCreateBatch, useUpdateBatch, useDeleteBatch } from '@/hooks/useBatches';
import { useCurrentUser } from '@/hooks/useAuth';
import { ProductType, BatchFilters } from '@/types';

/**
 * Farmer-specific batch hooks that automatically filter by current farmer
 */
export const useFarmerBatches = (filters?: Omit<BatchFilters, 'farmerId'>, type: ProductType = ProductType.coffee) => {
    const { data: user } = useCurrentUser();
    return useBatches({ ...filters, farmerId: user?.id }, type);
};

export const useFarmerCreateBatch = (type: ProductType = ProductType.coffee) => {
    return useCreateBatch(type);
};

export const useFarmerUpdateBatch = (type: ProductType = ProductType.coffee) => {
    return useUpdateBatch(type);
};

export const useFarmerDeleteBatch = (type: ProductType = ProductType.coffee) => {
    return useDeleteBatch(type);
};

