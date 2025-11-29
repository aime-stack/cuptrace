import { UserRole } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'cuptrace_token',
    USER_DATA: 'cuptrace_user',
    THEME: 'cuptrace_theme',
};

export const NAVIGATION_ITEMS: Record<string, Array<{ label: string; href: string; icon: string }>> = {
    [UserRole.farmer]: [
        { label: 'Dashboard', href: '/farmer', icon: 'LayoutDashboard' },
        { label: 'My Batches', href: '/farmer/batches', icon: 'Package' },
        { label: 'Payments', href: '/farmer/payments', icon: 'Wallet' },
        { label: 'Profile', href: '/farmer/profile', icon: 'User' },
    ],
    [UserRole.ws]: [
        { label: 'Dashboard', href: '/washing-station', icon: 'LayoutDashboard' },
        { label: 'Incoming Batches', href: '/washing-station/batches', icon: 'Package' },
        { label: 'Processing', href: '/washing-station/processing', icon: 'Settings' },
        { label: 'Inventory', href: '/washing-station/inventory', icon: 'ClipboardList' },
    ],
    [UserRole.admin]: [
        { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
        { label: 'Users', href: '/admin/users', icon: 'Users' },
        { label: 'Batches', href: '/admin/batches', icon: 'Package' },
        { label: 'Cooperatives', href: '/admin/cooperatives', icon: 'Building' },
        { label: 'Reports', href: '/admin/reports', icon: 'FileText' },
    ],
    [UserRole.exporter]: [
        { label: 'Dashboard', href: '/exporter', icon: 'LayoutDashboard' },
        { label: 'Exports', href: '/exporter/exports', icon: 'Ship' },
        { label: 'Certificates', href: '/exporter/certificates', icon: 'FileCheck' },
    ],
};

export const RWANDA_PROVINCES = [
    'Kigali City',
    'Northern Province',
    'Southern Province',
    'Eastern Province',
    'Western Province',
];
