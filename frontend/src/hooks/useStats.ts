import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export interface DashboardStats {
    totalUsers: number;
    totalBatches: number;
    pendingBatches: number;
    totalReports: number;
    totalCooperatives: number;
}

export interface FarmerStats {
    totalBatches: number;
    pendingBatches: number;
    inTransitBatches: number;
    completedBatches: number;
    totalPayments: number;
}

export interface WashingStationStats {
    totalBatches: number;
    pendingBatches: number;
    processingBatches: number;
    inventoryBatches: number;
}

export interface FactoryStats {
    readyToProcess: number;
    withQRCodes: number;
    nftsMinted: number;
}

export interface AgentStats {
    totalBatches: number;
    pendingBatches: number;
    approvedBatches: number;
    rejectedBatches: number;
    todayBatches: number;
}

export const useDashboardStats = () => {
    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: DashboardStats }>('/stats/dashboard');
            return data.data;
        },
        staleTime: 60 * 1000,
    });
};

export const useFarmerStats = () => {
    return useQuery({
        queryKey: ['farmer-stats'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: FarmerStats }>('/stats/farmer');
            return data.data;
        },
        staleTime: 60 * 1000,
    });
};

export const useWashingStationStats = () => {
    return useQuery({
        queryKey: ['washing-station-stats'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: WashingStationStats }>('/stats/washing-station');
            return data.data;
        },
        staleTime: 60 * 1000,
    });
};

export const useFactoryStats = () => {
    return useQuery({
        queryKey: ['factory-stats'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: FactoryStats }>('/stats/factory');
            return data.data;
        },
        staleTime: 60 * 1000,
    });
};

export const useAgentStats = () => {
    return useQuery({
        queryKey: ['agent-stats'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: AgentStats }>('/stats/agent');
            return data.data;
        },
        staleTime: 60 * 1000,
    });
};
