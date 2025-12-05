'use client';

import { Package, Settings, ClipboardList, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useCurrentUser } from '@/hooks/useAuth';
import { useBatches } from '@/hooks/useBatches';
import { ProductType } from '@/types';

export default function WashingStationDashboard() {
    const { data: user } = useCurrentUser();
    const { data: batches } = useBatches({ washingStationId: user?.id }, ProductType.coffee);

    const totalBatches = batches?.length || 0;
    const pendingBatches = batches?.filter((b: any) => b.status === 'pending').length || 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Washing Station Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Incoming Batches"
                    value={totalBatches}
                    icon={Package}
                    description="Total batches"
                />
                <StatsCard
                    title="Pending Processing"
                    value={pendingBatches}
                    icon={Settings}
                    description="Awaiting processing"
                    className="border-yellow-200"
                />
                <StatsCard
                    title="Processing"
                    value={0}
                    icon={Settings}
                    description="In progress"
                />
                <StatsCard
                    title="Inventory"
                    value={0}
                    icon={ClipboardList}
                    description="Current stock"
                />
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

