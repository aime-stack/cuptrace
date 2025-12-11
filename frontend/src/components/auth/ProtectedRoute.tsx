'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const { data: user, isLoading, isError } = useCurrentUser();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && (isError || !user)) {
            router.push('/login');
        }
    }, [user, isLoading, isError, router, mounted]);

    useEffect(() => {
        if (mounted && user && allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on role
            const roleRoutes: Record<UserRole, string> = {
                [UserRole.farmer]: '/farmer',
                [UserRole.agent]: '/agent',
                [UserRole.ws]: '/washing-station',
                [UserRole.factory]: '/factory',
                [UserRole.exporter]: '/exporter',
                [UserRole.importer]: '/importer',
                [UserRole.retailer]: '/retailer',
                [UserRole.admin]: '/admin',
                [UserRole.qc]: '/qc',
            };
            router.push(roleRoutes[user.role] || '/');
        }
    }, [user, allowedRoles, router, mounted]);

    // Always render the same loading state on server and initial client render
    if (!mounted || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-600" />
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-600" />
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-600" />
            </div>
        );
    }

    return <>{children}</>;
}
