'use client';

import Link from 'next/link';
import { Package, Wallet, Clock, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useCurrentUser } from '@/hooks/useAuth';
import { useBatches } from '@/hooks/useBatches';
import { ProductType } from '@/types';
import { formatCurrency, formatRelativeDate, getStatusColor } from '@/lib/utils';

import { StatsCardSkeleton } from '@/components/skeletons/StatsCardSkeleton';
import { useFarmerStats } from '@/hooks/useStats';

export default function FarmerDashboard() {
    const { data: user } = useCurrentUser();
    const { data: stats, isLoading: statsLoading } = useFarmerStats();

    // Fetch recent batches for the list (limited to 5)
    const { data: batchesData } = useBatches(
        { farmerId: user?.id, limit: 5 },
        ProductType.coffee
    );

    const batches = batchesData ?? [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Welcome back, {user?.name}
                </p>
            </div>

            {/* Stats Grid */}
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
                            title="Total Batches"
                            value={stats?.totalBatches || 0}
                            icon={Package}
                            description="Delivered to stations"
                        />
                        <StatsCard
                            title="Pending Review"
                            value={stats?.pendingBatches || 0}
                            icon={Clock}
                            description="Awaiting approval"
                            className="border-yellow-200 dark:border-yellow-900/50"
                        />
                        <StatsCard
                            title="In Supply Chain"
                            value={stats?.inTransitBatches || 0}
                            icon={TrendingUp}
                            description="Processing or shipped"
                            className="border-blue-200 dark:border-blue-900/50"
                        />
                        <StatsCard
                            title="Total Payments"
                            value={formatCurrency(stats?.totalPayments || 0)}
                            icon={Wallet}
                            description="Total received"
                        />
                    </>
                )}
            </div>

            {/* Recent Batches */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Your Batches</CardTitle>
                            <CardDescription>Track your coffee deliveries through the supply chain</CardDescription>
                        </div>
                        <Link href="/farmer/batches">
                            <Button variant="outline" size="sm">View All</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {batches.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No batches yet</h3>
                            <p className="text-gray-500">
                                Your agent will register batches on your behalf when you deliver coffee to the station.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {batches.slice(0, 5).map((batch: any) => (
                                <Link
                                    key={batch.id}
                                    href={`/farmer/batches/${batch.id}`}
                                    className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-medium">
                                                    {batch.lotId || `Batch #${batch.id.slice(0, 8)}`}
                                                </h4>
                                                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(batch.status)}`}>
                                                    {batch.status}
                                                </span>
                                                {batch.currentStage && (
                                                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                        {batch.currentStage}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span>{batch.type}</span>
                                                {batch.quantity && <span>{batch.quantity} kg</span>}
                                                {batch.originLocation && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {batch.originLocation}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right text-sm text-gray-500">
                                            {formatRelativeDate(batch.createdAt)}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/farmer/batches">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Track Batches
                            </CardTitle>
                            <CardDescription>
                                View your batches and their current stage in the supply chain
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Link href="/farmer/payments">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="h-5 w-5" />
                                View Payments
                            </CardTitle>
                            <CardDescription>
                                Track payments received for your coffee deliveries
                            </CardDescription>
                        </CardHeader>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
