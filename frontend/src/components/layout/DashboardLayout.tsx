'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, LogOut, User as UserIcon, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useLogout } from '@/hooks/useAuth';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import { getRoleLabel } from '@/lib/utils';
import * as Icons from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: user } = useCurrentUser();
    const logout = useLogout();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!user) return null;

    const navItems = NAVIGATION_ITEMS[user.role] || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Header */}
            <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-50">
                <div className="px-4 py-3 flex items-center justify-between">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Coffee className="h-6 w-6 text-coffee-600" />
                        <span className="text-xl font-bold text-coffee-900 dark:text-white hidden sm:inline">
                            CupTrace
                        </span>
                    </Link>

                    {/* User info */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleLabel(user.role)}</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={logout} className="h-9 w-9">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className={`
                    hidden lg:block
                    ${sidebarCollapsed ? 'w-16' : 'w-64'}
                    bg-white dark:bg-gray-800 border-r dark:border-gray-700
                    min-h-[calc(100vh-57px)] transition-all duration-300
                `}>
                    {/* Collapse toggle */}
                    <div className="p-2 flex justify-end">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                        >
                            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </button>
                    </div>

                    <nav className="px-2 space-y-1">
                        {navItems.map((item) => {
                            const Icon = (Icons as any)[item.icon] || UserIcon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={sidebarCollapsed ? item.label : undefined}
                                    className={`
                                        flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-coffee-100 dark:bg-coffee-900 text-coffee-900 dark:text-coffee-100 font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }
                                        ${sidebarCollapsed ? 'justify-center' : ''}
                                    `}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <aside className={`
                    lg:hidden fixed left-0 top-[57px] bottom-16 z-40
                    w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700
                    transform transition-transform duration-300
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = (Icons as any)[item.icon] || UserIcon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                                        ${isActive
                                            ? 'bg-coffee-100 dark:bg-coffee-900 text-coffee-900 dark:text-coffee-100 font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation - Icon Only */}
            <nav className="
                lg:hidden fixed bottom-0 left-0 right-0 z-50
                bg-white dark:bg-gray-800 border-t dark:border-gray-700
                px-2 py-2 safe-area-bottom
            ">
                <div className="flex items-center justify-around max-w-md mx-auto">
                    {navItems.slice(0, 5).map((item) => {
                        const Icon = (Icons as any)[item.icon] || UserIcon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex flex-col items-center justify-center p-2 min-w-[48px]
                                    rounded-lg transition-colors
                                    ${isActive
                                        ? 'text-coffee-600 dark:text-coffee-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }
                                `}
                            >
                                <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                                {/* Icon only - no label on mobile */}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

