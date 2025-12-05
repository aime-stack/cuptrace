import { axiosInstance } from '@/lib/axios';
import { ApiResponse, ProcessingRecord, CreateProcessingRecordRequest, UpdateProcessingRecordRequest } from '@/types';

export const listProcessingRecords = async (
    page: number = 1,
    limit: number = 10,
    batchId?: string,
    stage?: string
): Promise<ProcessingRecord[]> => {
    const params: any = { page, limit };
    if (batchId) params.batchId = batchId;
    if (stage) params.stage = stage;
    
    const { data } = await axiosInstance.get<ApiResponse<{ data: ProcessingRecord[]; pagination?: any }>>('/processing', { params });
    // Handle paginated response
    if (data.data && Array.isArray(data.data)) {
        return data.data;
    }
    // Handle nested pagination structure
    if (data.data && typeof data.data === 'object' && 'data' in data.data) {
        return (data.data as any).data || [];
    }
    return [];
};

export const listProcessingRecordsByBatch = async (batchId: string): Promise<ProcessingRecord[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ProcessingRecord[]>>(`/processing/batch/${batchId}`);
    return data.data || [];
};

export const getProcessingRecord = async (id: string): Promise<ProcessingRecord> => {
    const { data } = await axiosInstance.get<ApiResponse<ProcessingRecord>>(`/processing/${id}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Processing record not found');
};

export const createProcessingRecord = async (record: CreateProcessingRecordRequest): Promise<ProcessingRecord> => {
    const { data } = await axiosInstance.post<ApiResponse<ProcessingRecord>>('/processing', record);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create processing record');
};

export const updateProcessingRecord = async (id: string, record: UpdateProcessingRecordRequest): Promise<ProcessingRecord> => {
    const { data } = await axiosInstance.put<ApiResponse<ProcessingRecord>>(`/processing/${id}`, record);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update processing record');
};

export const deleteProcessingRecord = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/processing/${id}`);
};
