import { axiosInstance } from '@/lib/axios';
import { ApiResponse, ExportRecord, CreateExportRequest, UpdateExportRequest } from '@/types';

export const listExports = async (params?: {
    page?: number;
    limit?: number;
    exporterId?: string;
}): Promise<ExportRecord[]> => {
    const { data } = await axiosInstance.get<ApiResponse<{ data: ExportRecord[]; pagination?: any }>>('/exports', { params });
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

export const getExport = async (id: string): Promise<ExportRecord> => {
    const { data } = await axiosInstance.get<ApiResponse<ExportRecord>>(`/exports/${id}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Export record not found');
};

export const getExportByBatch = async (batchId: string): Promise<ExportRecord> => {
    const { data } = await axiosInstance.get<ApiResponse<ExportRecord>>(`/exports/batch/${batchId}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Export record not found');
};

export const createExport = async (exportData: CreateExportRequest): Promise<ExportRecord> => {
    const { data } = await axiosInstance.post<ApiResponse<ExportRecord>>('/exports', exportData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create export record');
};

export const updateExport = async (id: string, exportData: UpdateExportRequest): Promise<ExportRecord> => {
    const { data } = await axiosInstance.put<ApiResponse<ExportRecord>>(`/exports/${id}`, exportData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update export record');
};

export const deleteExport = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/exports/${id}`);
};

