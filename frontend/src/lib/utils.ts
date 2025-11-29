import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { BatchStatus, UserRole, SupplyChainStage } from "@/types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | undefined, formatStr: string = 'PPP'): string {
    if (!date) return 'N/A';
    return format(new Date(date), formatStr);
}

export function formatRelativeDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency: string = 'RWF'): string {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency,
    }).format(amount);
}

export function getStatusColor(status: BatchStatus | string): string {
    switch (status) {
        case BatchStatus.approved:
        case BatchStatus.ready_for_export:
        case BatchStatus.exported:
        case BatchStatus.delivered:
            return 'bg-green-100 text-green-800 border-green-200';
        case BatchStatus.pending:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case BatchStatus.rejected:
            return 'bg-red-100 text-red-800 border-red-200';
        case BatchStatus.processing:
            return 'bg-blue-100 text-blue-800 border-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

export function getRoleLabel(role: UserRole | string): string {
    switch (role) {
        case UserRole.farmer: return 'Farmer';
        case UserRole.ws: return 'Washing Station';
        case UserRole.factory: return 'Factory';
        case UserRole.exporter: return 'Exporter';
        case UserRole.importer: return 'Importer';
        case UserRole.retailer: return 'Retailer';
        case UserRole.admin: return 'Administrator';
        default: return role;
    }
}

export function getStageLabel(stage: SupplyChainStage | string): string {
    return stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
