import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as authService from '@/services/auth.service';
import * as cooperativeService from '@/services/cooperative.service';
import * as reportService from '@/services/report.service';
import { User } from '@/types';

/**
 * Admin-specific hooks for user management
 */
export const useAdminUsers = () => {
    return useQuery({
        queryKey: ['admin', 'users'],
        queryFn: () => authService.listUsers(),
    });
};

export const useAdminUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            authService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user');
        },
    });
};

export const useAdminDeactivateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => authService.deactivateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deactivated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to deactivate user');
        },
    });
};

export const useAdminActivateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => authService.activateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User activated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to activate user');
        },
    });
};

/**
 * Admin-specific hooks for cooperative management
 */
export const useAdminCooperatives = () => {
    return useQuery({
        queryKey: ['admin', 'cooperatives'],
        queryFn: () => cooperativeService.listCooperatives(),
    });
};

export const useAdminCreateCooperative = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => cooperativeService.createCooperative(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'cooperatives'] });
            queryClient.invalidateQueries({ queryKey: ['cooperatives'] });
            toast.success('Cooperative created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create cooperative');
        },
    });
};

/**
 * Admin-specific hooks for reports
 */
export const useAdminReports = () => {
    return useQuery({
        queryKey: ['admin', 'reports'],
        queryFn: async () => {
            // Placeholder - reports service needs to be implemented
            return [];
        },
    });
};

