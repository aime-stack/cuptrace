import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface DashboardStats {
    totalUsers: number;
    totalBatches: number;
    pendingBatches: number;
    totalReports: number;
    totalCooperatives: number;
}

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: DashboardStats }>('/stats/dashboard');
            return data.data;
        },
        staleTime: 60 * 1000, // Cache for 1 minute
    });
};
