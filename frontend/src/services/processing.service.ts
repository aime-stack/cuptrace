import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types';

// Placeholder types until fully defined
export interface ProcessingRecord {
    id: string;
    batchId: string;
    type: string;
    timestamp: string;
    [key: string]: any;
}

export const listProcessingRecords = async (batchId: string): Promise<ProcessingRecord[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ProcessingRecord[]>>(`/processing/batch/${batchId}`);
    return data.data || [];
};

export const createProcessingRecord = async (record: Omit<ProcessingRecord, 'id' | 'timestamp'>): Promise<ProcessingRecord> => {
    const { data } = await axiosInstance.post<ApiResponse<ProcessingRecord>>('/processing', record);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create processing record');
};
