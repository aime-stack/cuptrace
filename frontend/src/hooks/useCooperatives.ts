import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as cooperativeService from '@/services/cooperative.service';
import { Cooperative } from '@/types';

/**
 * List cooperatives query
 */
export const useCooperatives = () => {
    return useQuery({
        queryKey: ['cooperatives'],
        queryFn: cooperativeService.listCooperatives,
    });
};

/**
 * Get cooperative query
 */
export const useCooperative = (id: string) => {
    return useQuery({
        queryKey: ['cooperative', id],
        queryFn: () => cooperativeService.getCooperative(id),
        enabled: !!id,
    });
};

/**
 * Create cooperative mutation
 */
export const useCreateCooperative = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Omit<Cooperative, 'id' | 'createdAt' | 'updatedAt'>) =>
            cooperativeService.createCooperative(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cooperatives'] });
            toast.success('Cooperative created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create cooperative');
        },
    });
};

/**
 * Update cooperative mutation
 */
export const useUpdateCooperative = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Cooperative> }) =>
            cooperativeService.updateCooperative(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['cooperatives'] });
            queryClient.invalidateQueries({ queryKey: ['cooperative', variables.id] });
            toast.success('Cooperative updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update cooperative');
        },
    });
};

/**
 * Delete cooperative mutation
 */
export const useDeleteCooperative = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => cooperativeService.deleteCooperative(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cooperatives'] });
            toast.success('Cooperative deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete cooperative');
        },
    });
};
