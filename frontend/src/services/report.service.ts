import { axiosInstance } from '@/lib/axios';
import { ApiResponse } from '@/types';

export const generateNaebReport = async (params: any): Promise<Blob> => {
    const { data } = await axiosInstance.get('/reports/naeb', {
        params,
        responseType: 'blob'
    });
    return data;
};
