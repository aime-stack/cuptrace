'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { getRoleLabel } from '@/lib/utils';
import * as Icons from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: user } = useCurrentUser();
    const logout = useLogout();

    if (!user) return null;

    const navItems = NAVIGATION_ITEMS[user.role] || [];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Coffee className="h-6 w-6 text-coffee-600" />
                        <span className="text-xl font-bold text-coffee-900">CupTrace</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={logout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] p-4">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = (Icons as any)[item.icon] || UserIcon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-coffee-100 text-coffee-900 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
