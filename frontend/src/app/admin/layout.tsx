'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={[UserRole.admin]}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
    );
}

