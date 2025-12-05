'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';

export default function ImporterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={[UserRole.importer]}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
    );
}

