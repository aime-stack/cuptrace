import { axiosInstance } from '@/lib/axios';
import { ApiResponse, Report, CreateReportRequest, UpdateReportRequest } from '@/types';

export const listReports = async (params?: {
    page?: number;
    limit?: number;
    reportType?: string;
    status?: string;
    generatedBy?: string;
}): Promise<Report[]> => {
    const { data } = await axiosInstance.get<ApiResponse<{ data: Report[]; pagination?: any }>>('/reports', { params });
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

export const getReport = async (id: string): Promise<Report> => {
    const { data } = await axiosInstance.get<ApiResponse<Report>>(`/reports/${id}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Report not found');
};

export const createReport = async (reportData: CreateReportRequest): Promise<Report> => {
    const { data } = await axiosInstance.post<ApiResponse<Report>>('/reports', reportData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create report');
};

export const updateReport = async (id: string, reportData: UpdateReportRequest): Promise<Report> => {
    const { data } = await axiosInstance.put<ApiResponse<Report>>(`/reports/${id}`, reportData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update report');
};

export const submitReport = async (id: string): Promise<Report> => {
    const { data } = await axiosInstance.post<ApiResponse<Report>>(`/reports/${id}/submit`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to submit report');
};

export const approveReport = async (id: string): Promise<Report> => {
    const { data } = await axiosInstance.post<ApiResponse<Report>>(`/reports/${id}/approve`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to approve report');
};

export const rejectReport = async (id: string): Promise<Report> => {
    const { data } = await axiosInstance.post<ApiResponse<Report>>(`/reports/${id}/reject`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to reject report');
};

export const deleteReport = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/reports/${id}`);
};

export const generateNaebReport = async (params: any): Promise<Blob> => {
    const { data } = await axiosInstance.get('/reports/naeb', {
        params,
        responseType: 'blob'
    });
    return data;
};
