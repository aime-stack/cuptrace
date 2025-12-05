import * as authService from '@/services/auth.service';
import * as cooperativeService from '@/services/cooperative.service';
import * as batchService from '@/services/batch.service';
import * as reportService from '@/services/report.service';
import { User, ProductType } from '@/types';

/**
 * Admin-specific service methods
 */
export const adminService = {
    /**
     * User management
     */
    users: {
        list: () => authService.listUsers(),
        getById: (id: string) => authService.getUserById(id),
        update: (id: string, data: Partial<User>) => authService.updateUser(id, data),
        deactivate: (id: string) => authService.deactivateUser(id),
        activate: (id: string) => authService.activateUser(id),
    },

    /**
     * Cooperative management
     */
    cooperatives: {
        list: () => cooperativeService.listCooperatives(),
        getById: (id: string) => cooperativeService.getCooperative(id),
        create: (data: any) => cooperativeService.createCooperative(data),
        update: (id: string, data: any) => cooperativeService.updateCooperative(id, data),
        delete: (id: string) => cooperativeService.deleteCooperative(id),
    },

    /**
     * Batch management
     */
    batches: {
        approve: (id: string, type: ProductType = ProductType.coffee) => batchService.approveBatch(id, type),
        reject: (id: string, reason: string, type: ProductType = ProductType.coffee) => batchService.rejectBatch(id, reason, type),
    },

    /**
     * Reports
     */
    reports: {
        generate: (params: any) => reportService.generateNaebReport(params),
    },
};

