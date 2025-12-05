import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as exportService from '@/services/export.service';
import * as certificateService from '@/services/certificate.service';

/**
 * Exporter-specific hooks
 */
export const useExporterExports = () => {
    return useQuery({
        queryKey: ['exporter', 'exports'],
        queryFn: () => exportService.listExports(),
    });
};

export const useExporterCreateExport = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => exportService.createExport(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exporter', 'exports'] });
            queryClient.invalidateQueries({ queryKey: ['exports'] });
            toast.success('Export record created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create export record');
        },
    });
};

export const useExporterCertificates = () => {
    return useQuery({
        queryKey: ['exporter', 'certificates'],
        queryFn: () => certificateService.listCertificates(),
    });
};

export const useExporterUploadCertificate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => certificateService.createCertificate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exporter', 'certificates'] });
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
            toast.success('Certificate created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create certificate');
        },
    });
};

