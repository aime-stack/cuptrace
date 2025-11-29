import { axiosInstance } from '@/lib/axios';
import { Cooperative, ApiResponse } from '@/types';

export const listCooperatives = async (): Promise<Cooperative[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Cooperative[]>>('/cooperatives');
    return data.data || [];
};

export const getCooperative = async (id: string): Promise<Cooperative> => {
    const { data } = await axiosInstance.get<ApiResponse<Cooperative>>(`/cooperatives/${id}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Cooperative not found');
};

export const createCooperative = async (coopData: Omit<Cooperative, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cooperative> => {
    const { data } = await axiosInstance.post<ApiResponse<Cooperative>>('/cooperatives', coopData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create cooperative');
};

export const updateCooperative = async (id: string, coopData: Partial<Cooperative>): Promise<Cooperative> => {
    const { data } = await axiosInstance.patch<ApiResponse<Cooperative>>(`/cooperatives/${id}`, coopData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update cooperative');
};

export const deleteCooperative = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cooperatives/${id}`);
};
