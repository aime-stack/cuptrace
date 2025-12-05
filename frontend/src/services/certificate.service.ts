import { axiosInstance } from '@/lib/axios';
import { ApiResponse, Certificate, CreateCertificateRequest, UpdateCertificateRequest } from '@/types';

export const listCertificates = async (params?: {
    page?: number;
    limit?: number;
    batchId?: string;
}): Promise<Certificate[]> => {
    const { data } = await axiosInstance.get<ApiResponse<{ data: Certificate[]; pagination?: any }>>('/certificates', { params });
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

export const getCertificate = async (id: string): Promise<Certificate> => {
    const { data } = await axiosInstance.get<ApiResponse<Certificate>>(`/certificates/${id}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Certificate not found');
};

export const getCertificateByNumber = async (certificateNumber: string): Promise<Certificate> => {
    const { data } = await axiosInstance.get<ApiResponse<Certificate>>(`/certificates/number/${certificateNumber}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Certificate not found');
};

export const listCertificatesByBatch = async (batchId: string): Promise<Certificate[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Certificate[]>>(`/certificates/batch/${batchId}`);
    return data.data || [];
};

export const createCertificate = async (certificateData: CreateCertificateRequest): Promise<Certificate> => {
    const { data } = await axiosInstance.post<ApiResponse<Certificate>>('/certificates', certificateData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create certificate');
};

export const updateCertificate = async (id: string, certificateData: UpdateCertificateRequest): Promise<Certificate> => {
    const { data } = await axiosInstance.put<ApiResponse<Certificate>>(`/certificates/${id}`, certificateData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update certificate');
};

export const deleteCertificate = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/certificates/${id}`);
};

export const uploadCertificate = async (certificateData: CreateCertificateRequest): Promise<Certificate> => {
    // Backend uses POST /certificates, not a separate upload endpoint
    return createCertificate(certificateData);
};
