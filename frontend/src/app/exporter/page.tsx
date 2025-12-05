'use client';

import { Ship, FileCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { useCurrentUser } from '@/hooks/useAuth';
import * as exportService from '@/services/export.service';
import * as certificateService from '@/services/certificate.service';
import { useQuery } from '@tanstack/react-query';

export default function ExporterDashboard() {
    const { data: user } = useCurrentUser();
    const { data: exports } = useQuery({
        queryKey: ['exports', user?.id],
        queryFn: () => exportService.listExports({ exporterId: user?.id }),
    });
    const { data: certificates } = useQuery({
        queryKey: ['certificates', user?.id],
        queryFn: () => certificateService.listCertificates(),
    });

    const totalExports = exports?.length || 0;
    const totalCertificates = certificates?.length || 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Exporter Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Exports"
                    value={totalExports}
                    icon={Ship}
                    description="All exports"
                />
                <StatsCard
                    title="Certificates"
                    value={totalCertificates}
                    icon={FileCheck}
                    description="Available certificates"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest export activities</CardDescription>
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

