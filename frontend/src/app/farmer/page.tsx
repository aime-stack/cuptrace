'use client';

import Link from 'next/link';
import { Package, Wallet, CheckCircle, Clock, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useCurrentUser } from '@/hooks/useAuth';
import { useBatches } from '@/hooks/useBatches';
import { ProductType, BatchStatus, SupplyChainStage } from '@/types';
import { formatCurrency, formatRelativeDate, getStatusColor } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import * as paymentService from '@/services/payment.service';

export default function FarmerDashboard() {
    const { data: user } = useCurrentUser();
    const { data: batchesData } = useBatches(
        { farmerId: user?.id },
        ProductType.coffee
    );

<<<<<<< HEAD:frontend/src/app/farmer/page.tsx
    // Fetch payments for the farmer
    const { data: paymentsData } = useQuery({
        queryKey: ['payments', user?.id],
        queryFn: () => paymentService.listPayments({ payeeId: user?.id }),
        enabled: !!user?.id,
    });

    const batches = batchesData || [];
    const totalBatches = batches.length;
    const pendingBatches = batches.filter(b => b.status === BatchStatus.pending).length;
    const approvedBatches = batches.filter(b => b.status === BatchStatus.approved).length;
    
    // Calculate total payments received
    const payments = paymentsData || [];
    const totalPayments = payments
        .filter((p: any) => p.status === 'completed')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
=======
    const batches = batchesData ?? [];
    const totalBatches = batches.length;
    const pendingBatches = batches.filter((b: any) => b.status === BatchStatus.pending).length;
    const approvedBatches = batches.filter((b: any) => b.status === BatchStatus.approved).length;
    const inTransit = batches.filter((b: any) =>
        b.currentStage !== SupplyChainStage.farmer
    ).length;
>>>>>>> c259597 (All):frontend/src/app/(dashboard)/farmer/page.tsx

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
                <StatsCard
                    title="Total Batches"
                    value={totalBatches}
                    icon={Package}
                    description="Delivered to stations"
                />
                <StatsCard
                    title="Pending Review"
                    value={pendingBatches}
                    icon={Clock}
                    description="Awaiting approval"
                    className="border-yellow-200"
                />
                <StatsCard
                    title="In Supply Chain"
                    value={inTransit}
                    icon={TrendingUp}
                    description="Processing or shipped"
                    className="border-blue-200"
                />
                <StatsCard
                    title="Total Payments"
                    value={formatCurrency(totalPayments)}
                    icon={Wallet}
                    description={`${payments.filter((p: any) => p.status === 'completed').length} completed`}
                />
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
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                    {batch.currentStage}
                                                </span>
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

