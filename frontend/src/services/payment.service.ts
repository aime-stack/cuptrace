import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types';

// Placeholder types
export interface Payment {
    id: string;
    amount: number;
    status: string;
    [key: string]: any;
}

export const listPayments = async (): Promise<Payment[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Payment[]>>('/payments');
    return data.data || [];
};

export const createPayment = async (payment: any): Promise<Payment> => {
    const { data } = await axiosInstance.post<ApiResponse<Payment>>('/payments', payment);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create payment');
};
