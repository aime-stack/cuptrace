import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types';

// Placeholder types
export interface ExportRecord {
    id: string;
    destination: string;
    status: string;
    [key: string]: any;
}

export const listExports = async (): Promise<ExportRecord[]> => {
    const { data } = await axiosInstance.get<ApiResponse<ExportRecord[]>>('/exports');
    return data.data || [];
};

export const createExport = async (exportData: any): Promise<ExportRecord> => {
    const { data } = await axiosInstance.post<ApiResponse<ExportRecord>>('/exports', exportData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create export record');
};
