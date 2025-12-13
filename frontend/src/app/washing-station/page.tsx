'use client';

import { Package, Settings, ClipboardList, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useCurrentUser } from '@/hooks/useAuth';
import { useWashingStationStats } from '@/hooks/useStats';
import { StatsCardSkeleton } from '@/components/skeletons/StatsCardSkeleton';

export default function WashingStationDashboard() {
    const { data: user } = useCurrentUser();
    const { data: stats, isLoading: statsLoading } = useWashingStationStats();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Washing Station Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsLoading ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatsCard
                            title="Incoming Batches"
                            value={stats?.totalBatches || 0}
                            icon={Package}
                            description="Total batches"
                        />
                        <StatsCard
                            title="Pending Processing"
                            value={stats?.pendingBatches || 0}
                            icon={Settings}
                            description="Awaiting processing"
                            className="border-yellow-200 dark:border-yellow-900/50"
                        />
                        <StatsCard
                            title="Processing"
                            value={stats?.processingBatches || 0}
                            icon={Settings}
                            description="In progress"
                        />
                        <StatsCard
                            title="Inventory"
                            value={stats?.inventoryBatches || 0}
                            icon={ClipboardList}
                            description="Current stock"
                        />
                    </>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest processing activities</CardDescription>
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

