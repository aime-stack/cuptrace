import * as exportService from '@/services/export.service';
import * as certificateService from '@/services/certificate.service';

/**
 * Exporter-specific service methods
 */
export const exporterService = {
    /**
     * Export records
     */
    exports: {
        list: () => exportService.listExports(),
        create: (data: any) => exportService.createExport(data),
    },

    /**
     * Certificates
     */
    certificates: {
        list: () => certificateService.listCertificates(),
        create: (data: any) => certificateService.createCertificate(data),
    },
};

