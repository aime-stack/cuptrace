import { axiosInstance } from '@/lib/axios';
import { ApiResponse, BatchHistory, UpdateStageRequest, ProductBatch, ProductType } from '@/types';

export const updateCoffeeStage = async (
    batchId: string,
    stageData: UpdateStageRequest
): Promise<ProductBatch> => {
    const { data } = await axiosInstance.put<ApiResponse<ProductBatch>>(`/stage/coffee/${batchId}`, stageData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update coffee batch stage');
};

export const updateTeaStage = async (
    batchId: string,
    stageData: UpdateStageRequest
): Promise<ProductBatch> => {
    const { data } = await axiosInstance.put<ApiResponse<ProductBatch>>(`/stage/tea/${batchId}`, stageData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update tea batch stage');
};

export const getBatchHistory = async (batchId: string): Promise<BatchHistory[]> => {
    const { data } = await axiosInstance.get<ApiResponse<BatchHistory[]>>(`/stage/${batchId}/history`);
    return data.data || [];
};

