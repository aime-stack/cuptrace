import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and allowed roles
const ROLE_ROUTES: Record<string, string[]> = {
    '/farmer': ['farmer'],
    '/agent': ['agent'],
    '/washing-station': ['ws'],
    '/qc': ['qc'],
    '/factory': ['factory'],
    '/exporter': ['exporter'],
    '/admin': ['admin'],
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('cuptrace_token')?.value;
    const userRole = request.cookies.get('cuptrace_role')?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't need auth
    if (
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/verify') ||
        pathname === '/' ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // Static files
    ) {
        // If user is logged in and tries to access login/register, redirect to their dashboard
        if (token && userRole && (pathname === '/login' || pathname === '/register')) {
            const dashboardMap: Record<string, string> = {
                'farmer': '/farmer',
                'agent': '/agent',
                'ws': '/washing-station',
                'qc': '/qc',
                'factory': '/factory',
                'exporter': '/exporter',
                'admin': '/admin'
            };
            return NextResponse.redirect(new URL(dashboardMap[userRole] || '/', request.url));
        }
        return NextResponse.next();
    }

    // Check if user is authenticated
    if (!token || !userRole) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based access control
    // Check if the current path starts with any of the protected prefixes
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
        if (pathname.startsWith(routePrefix)) {
            if (!allowedRoles.includes(userRole)) {
                // User does not have permission, redirect to their allowed dashboard
                const dashboardMap: Record<string, string> = {
                    'farmer': '/farmer',
                    'agent': '/agent',
                    'ws': '/washing-station',
                    'qc': '/qc',
                    'factory': '/factory',
                    'exporter': '/exporter',
                    'admin': '/admin'
                };
                return NextResponse.redirect(new URL(dashboardMap[userRole] || '/login', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
