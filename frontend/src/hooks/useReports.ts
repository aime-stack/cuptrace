import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as reportService from '@/services/report.service';
import { CreateReportRequest } from '@/types';

/**
 * List reports query
 */
export const useReports = () => {
    return useQuery({
        queryKey: ['reports'],
        queryFn: () => reportService.listReports(),
    });
};

/**
 * Create report mutation
 */
export const useCreateReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateReportRequest) => reportService.createReport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            toast.success('Report generated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to generate report');
        },
    });
};
