import { UserRole } from '@/types';

/**
 * Get the dashboard route for a given role
 */
export const getRoleRoute = (role: UserRole): string => {
    const roleRoutes: Record<UserRole, string> = {
        [UserRole.farmer]: '/farmer',
        [UserRole.ws]: '/washing-station',
        [UserRole.factory]: '/factory',
        [UserRole.exporter]: '/exporter',
        [UserRole.importer]: '/importer',
        [UserRole.retailer]: '/retailer',
        [UserRole.admin]: '/admin',
        [UserRole.agent]: '/agent',
        [UserRole.qc]: '/qc',
    };
    return roleRoutes[role] || '/';
};

/**
 * Get all routes for a given role
 */
export const getRoleRoutes = (role: UserRole): string[] => {
    const routes: Record<UserRole, string[]> = {
        [UserRole.farmer]: ['/farmer', '/farmer/batches', '/farmer/payments', '/farmer/profile'],
        [UserRole.ws]: ['/washing-station', '/washing-station/batches', '/washing-station/processing', '/washing-station/inventory'],
        [UserRole.factory]: ['/factory'],
        [UserRole.exporter]: ['/exporter', '/exporter/exports', '/exporter/certificates'],
        [UserRole.importer]: ['/importer'],
        [UserRole.retailer]: ['/retailer'],
        [UserRole.admin]: ['/admin', '/admin/users', '/admin/batches', '/admin/cooperatives', '/admin/reports'],
        [UserRole.agent]: ['/agent'],
        [UserRole.qc]: ['/qc'],
    };
    return routes[role] || [];
};

/**
 * Check if a route is accessible by a role
 */
export const isRouteAccessible = (route: string, role: UserRole): boolean => {
    const roleRoutes = getRoleRoutes(role);
    return roleRoutes.some(r => route === r || route.startsWith(r + '/'));
};

