import { axiosInstance } from '@/lib/axios';
import { ApiResponse, Payment, CreatePaymentRequest, UpdatePaymentRequest } from '@/types';

export const listPayments = async (params?: {
    page?: number;
    limit?: number;
    batchId?: string;
    paymentType?: string;
    status?: string;
    payeeId?: string;
    payerId?: string;
}): Promise<Payment[]> => {
    const { data } = await axiosInstance.get<ApiResponse<{ data: Payment[]; pagination?: any }>>('/payments', { params });
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

export const getPayment = async (id: string): Promise<Payment> => {
    const { data } = await axiosInstance.get<ApiResponse<Payment>>(`/payments/${id}`);
    if (data.data) return data.data;
    throw new Error(data.message || 'Payment not found');
};

export const createPayment = async (payment: CreatePaymentRequest): Promise<Payment> => {
    const { data } = await axiosInstance.post<ApiResponse<Payment>>('/payments', payment);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create payment');
};

export const updatePayment = async (id: string, payment: UpdatePaymentRequest): Promise<Payment> => {
    const { data } = await axiosInstance.put<ApiResponse<Payment>>(`/payments/${id}`, payment);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update payment');
};

export const deletePayment = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/payments/${id}`);
};

