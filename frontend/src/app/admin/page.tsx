'use client';

import Link from 'next/link';
import { Package, CheckCircle, Clock, Users, BarChart, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatsCardSkeleton } from '@/components/skeletons/StatsCardSkeleton';
import { useDashboardStats } from '@/hooks/useStats';

export default function AdminDashboard() {
    const { data: stats, isLoading } = useDashboardStats();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">System overview and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatsCard
                            title="Total Batches"
                            value={stats?.totalBatches || 0}
                            icon={Package}
                            description="All batches in system"
                        />
                        <StatsCard
                            title="Pending Approval"
                            value={stats?.pendingBatches || 0}
                            icon={Clock}
                            description="Require review"
                            className="border-yellow-200"
                        />
                        <StatsCard
                            title="Total Users"
                            value={stats?.totalUsers || 0}
                            icon={Users}
                            description="Registered users"
                        />
                        <StatsCard
                            title="Reports"
                            value={stats?.totalReports || 0}
                            icon={FileText}
                            description="Generated reports"
                        />
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/admin/users">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Manage Users
                            </CardTitle>
                            <CardDescription>
                                View and manage all system users
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/admin/batches">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Review Batches
                            </CardTitle>
                            <CardDescription>
                                Approve or reject pending batches
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/admin/analytics">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart className="h-5 w-5" />
                                Analytics
                            </CardTitle>
                            <CardDescription>
                                View system analytics and insights
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/admin/cooperatives">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Cooperatives
                            </CardTitle>
                            <CardDescription>
                                Manage farmer cooperatives
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/admin/reports">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                NAEB Reports
                            </CardTitle>
                            <CardDescription>
                                Generate and view reports
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        Activity tracking coming soon
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

