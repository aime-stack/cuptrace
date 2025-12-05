import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as authService from '@/services/auth.service';
import { LoginRequest, RegisterRequest, User } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Login mutation
 */
export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),
        onSuccess: (data) => {
            queryClient.setQueryData(['currentUser'], data.user);
            toast.success('Login successful!');

            // Redirect based on role
            const roleRoutes: Record<string, string> = {
                farmer: '/farmer',
                ws: '/washing-station',
                factory: '/factory',
                exporter: '/exporter',
                importer: '/importer',
                retailer: '/retailer',
                admin: '/admin',
            };

            router.push(roleRoutes[data.user.role] || '/');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Login failed');
        },
    });
};

/**
 * Register mutation
 */
export const useRegister = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData: RegisterRequest) => authService.register(userData),
        onSuccess: (data) => {
            queryClient.setQueryData(['currentUser'], data.user);
            toast.success('Registration successful!');

            // Redirect based on role
            const roleRoutes: Record<string, string> = {
                farmer: '/farmer',
                ws: '/washing-station',
                factory: '/factory',
                exporter: '/exporter',
                importer: '/importer',
                retailer: '/retailer',
                admin: '/admin',
            };

            router.push(roleRoutes[data.user.role] || '/');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Registration failed');
        },
    });
};

/**
 * Current user query
 */
export const useCurrentUser = () => {
    // Only fetch user if token exists
    const token = typeof window !== 'undefined' 
        ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) 
        : null;
    
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        retry: false,
        staleTime: Infinity,
        enabled: !!token, // Only run query if token exists
    });
};

/**
 * Logout function
 */
export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return () => {
        authService.logout();
        queryClient.clear();
        router.push('/login');
        toast.success('Logged out successfully');
    };
};

/**
 * List users query (admin only)
 */
export const useUsers = (params?: { role?: string; search?: string }) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => authService.listUsers(params),
    });
};

/**
 * Get user by ID
 */
export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => authService.getUserById(id),
        enabled: !!id,
    });
};

/**
 * Update user mutation
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            authService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user');
        },
    });
};

/**
 * Change password mutation
 */
export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
            authService.changePassword(oldPassword, newPassword),
        onSuccess: () => {
            toast.success('Password changed successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to change password');
        },
    });
};

/**
 * Deactivate user mutation
 */
export const useDeactivateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => authService.deactivateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deactivated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to deactivate user');
        },
    });
};

/**
 * Activate user mutation
 */
export const useActivateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => authService.activateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User activated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to activate user');
        },
    });
};
