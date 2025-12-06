import { axiosInstance } from '@/lib/axios';
import {
    ProductBatch,
    CreateBatchRequest,
    UpdateBatchRequest,
    BatchFilters,
    ProductType,
    ApiResponse
} from '@/types';

export const listBatches = async (filters?: BatchFilters, type: ProductType = ProductType.coffee): Promise<ProductBatch[]> => {
    const endpoint = type === ProductType.coffee ? '/coffee' : '/tea';
<<<<<<< HEAD
    const { data } = await axiosInstance.get<ApiResponse<{ data: ProductBatch[]; pagination?: any }>>(endpoint, { params: filters });
    // Handle paginated response
    if (data.data && Array.isArray(data.data)) {
        return data.data;
    }
    // Handle nested pagination structure
    if (data.data && typeof data.data === 'object' && 'data' in data.data) {
        return (data.data as any).data || [];
=======
    const { data } = await axiosInstance.get<any>(endpoint, { params: filters });
    // Handle both direct array response and paginated response
    // API returns { success, data: { data: [], pagination: {} } } for paginated
    // or { success, data: [] } for direct
    const responseData = data?.data;
    if (Array.isArray(responseData)) {
        return responseData;
    }
    if (responseData?.data && Array.isArray(responseData.data)) {
        return responseData.data;
>>>>>>> c259597 (All)
    }
    return [];
};

export const getBatch = async (id: string, type: ProductType = ProductType.coffee): Promise<ProductBatch> => {
    const endpoint = type === ProductType.coffee ? `/coffee/${id}` : `/tea/${id}`;
    const { data } = await axiosInstance.get<ApiResponse<ProductBatch>>(endpoint);
    if (data.data) return data.data;
    throw new Error(data.message || 'Batch not found');
};

export const createBatch = async (batchData: CreateBatchRequest, type: ProductType = ProductType.coffee): Promise<ProductBatch> => {
    const endpoint = type === ProductType.coffee ? '/coffee' : '/tea';
    const { data } = await axiosInstance.post<ApiResponse<ProductBatch>>(endpoint, batchData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create batch');
};

export const updateBatch = async (id: string, batchData: UpdateBatchRequest, type: ProductType = ProductType.coffee): Promise<ProductBatch> => {
    const endpoint = type === ProductType.coffee ? `/coffee/${id}` : `/tea/${id}`;
    const { data } = await axiosInstance.put<ApiResponse<ProductBatch>>(endpoint, batchData);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to update batch');
};

export const deleteBatch = async (id: string, type: ProductType = ProductType.coffee): Promise<void> => {
    const endpoint = type === ProductType.coffee ? `/coffee/${id}` : `/tea/${id}`;
    await axiosInstance.delete(endpoint);
};

export const approveBatch = async (id: string, type: ProductType = ProductType.coffee): Promise<ProductBatch> => {
    const endpoint = type === ProductType.coffee ? `/coffee/${id}/approve` : `/tea/${id}/approve`;
    const { data } = await axiosInstance.post<ApiResponse<ProductBatch>>(endpoint);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to approve batch');
};

export const rejectBatch = async (id: string, reason: string, type: ProductType = ProductType.coffee): Promise<ProductBatch> => {
    const endpoint = type === ProductType.coffee ? `/coffee/${id}/reject` : `/tea/${id}/reject`;
    const { data } = await axiosInstance.post<ApiResponse<ProductBatch>>(endpoint, { reason });
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to reject batch');
};

export const verifyBatchByQRCode = async (qrCode: string, type: ProductType = ProductType.coffee): Promise<ProductBatch> => {
    const endpoint = type === ProductType.coffee ? `/coffee/verify/${qrCode}` : `/tea/verify/${qrCode}`;
    const { data } = await axiosInstance.get<ApiResponse<ProductBatch>>(endpoint);
    if (data.data) return data.data;
    throw new Error(data.message || 'Batch not found');
};

export const getBatchByLotId = async (lotId: string, type: ProductType = ProductType.coffee): Promise<ProductBatch> => {
    const endpoint = type === ProductType.coffee ? `/coffee/lot/${lotId}` : `/tea/lot/${lotId}`;
    const { data } = await axiosInstance.get<ApiResponse<ProductBatch>>(endpoint);
    if (data.data) return data.data;
    throw new Error(data.message || 'Batch not found');
};

export const retryMintNFT = async (id: string, type: ProductType = ProductType.coffee): Promise<{ policyId: string; assetName: string; txHash: string }> => {
    const endpoint = type === ProductType.coffee ? `/coffee/${id}/retry-mint-nft` : `/tea/${id}/retry-mint-nft`;
    const { data } = await axiosInstance.post<ApiResponse<{ policyId: string; assetName: string; txHash: string }>>(endpoint);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to mint NFT');
};

export const retryBlockchainRecord = async (id: string, type: ProductType = ProductType.coffee): Promise<{ txHash: string }> => {
    const endpoint = type === ProductType.coffee ? `/coffee/${id}/retry-blockchain` : `/tea/${id}/retry-blockchain`;
    const { data } = await axiosInstance.post<ApiResponse<{ txHash: string }>>(endpoint);
    if (data.data) return data.data;
    throw new Error(data.message || 'Failed to create blockchain record');
};
