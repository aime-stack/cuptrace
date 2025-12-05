'use client';

import { Package, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useCurrentUser } from '@/hooks/useAuth';
import { useBatches } from '@/hooks/useBatches';
import { ProductType } from '@/types';

export default function FactoryDashboard() {
    const { data: user } = useCurrentUser();
    const { data: batches } = useBatches({ factoryId: user?.id }, ProductType.coffee);

    const totalBatches = batches?.length || 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Factory Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Batches"
                    value={totalBatches}
                    icon={Package}
                    description="Batches in factory"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest factory activities</CardDescription>
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

