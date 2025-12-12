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
        { label: 'Community', href: '/farmer/community', icon: 'Users2' },
        { label: 'Profile', href: '/farmer/profile', icon: 'User' },
    ],
    [UserRole.agent]: [
        { label: 'Dashboard', href: '/agent', icon: 'LayoutDashboard' },
        { label: 'Register Batch', href: '/agent/batches/new', icon: 'Plus' },
        { label: 'Farmers', href: '/agent/farmers', icon: 'Users' },
        { label: 'Profile', href: '/agent/profile', icon: 'User' },
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
    [UserRole.qc]: [
        { label: 'Dashboard', href: '/qc', icon: 'LayoutDashboard' },
        { label: 'Pending Grading', href: '/qc/grading', icon: 'ClipboardCheck' },
        { label: 'History', href: '/qc/history', icon: 'History' },
    ],
    [UserRole.factory]: [
        { label: 'Dashboard', href: '/factory', icon: 'LayoutDashboard' },
        { label: 'Processing', href: '/factory/processing', icon: 'Settings' },
        { label: 'Inventory', href: '/factory/inventory', icon: 'Package' },
    ],
};

export const RWANDA_PROVINCES = [
    'Kigali City',
    'Northern Province',
    'Southern Province',
    'Eastern Province',
    'Western Province',
];

export const COFFEE_GRADES = [
    'A1', 'A2', 'A3',
    'B1', 'B2',
    'C1', 'C2',
    'PB', // Peaberry
    'E',  // Elephant
    'UG', // Under Grade
    'Triage'
];

export const PROCESSING_TYPES = [
    'Fully Washed',
    'Semi Washed',
    'Natural',
    'Honey',
    'Anaerobic',
    'Wet Hulling'
];

export const TEA_TYPES = [
    'Black Tea',
    'Green Tea',
    'White Tea',
    'Oolong Tea',
    'Orthodox Tea'
];

export const TEA_GRADES = [
    'BP1', // Broken Pekoe 1
    'PF1', // Pekoe Fannings 1
    'PD',  // Pekoe Dust
    'D1',  // Dust 1
    'FNGS' // Fannings
];
