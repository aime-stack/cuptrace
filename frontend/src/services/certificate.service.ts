import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types';

// Placeholder types
export interface Certificate {
    id: string;
    type: string;
    url: string;
    [key: string]: any;
}

export const listCertificates = async (): Promise<Certificate[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Certificate[]>>('/certificates');
    return data.data || [];
};

export const uploadCertificate = async (formData: FormData): Promise<Certificate> => {
    const { data } = await axiosInstance.post<ApiResponse<Certificate>>('/certificates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to upload certificate');
};
