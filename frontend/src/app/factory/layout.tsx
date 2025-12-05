'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';

export default function FactoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={[UserRole.factory]}>
            <DashboardLayout>{children}</DashboardLayout>
        </ProtectedRoute>
    );
}

