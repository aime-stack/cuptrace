'use client';

import { useEffect } from 'react';
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

    useEffect(() => {
        if (!isLoading && (isError || !user)) {
            router.push('/login');
        }
    }, [user, isLoading, isError, router]);

    useEffect(() => {
        if (user && allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on role
            const roleRoutes: Record<UserRole, string> = {
                [UserRole.farmer]: '/farmer',
                [UserRole.ws]: '/washing-station',
                [UserRole.factory]: '/factory',
                [UserRole.exporter]: '/exporter',
                [UserRole.importer]: '/importer',
                [UserRole.retailer]: '/retailer',
                [UserRole.admin]: '/admin',
            };
            router.push(roleRoutes[user.role]);
        }
    }, [user, allowedRoles, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-600" />
            </div>
        );
    }

    if (isError || !user) {
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
