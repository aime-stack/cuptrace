'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ClipboardCheck,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import Link from 'next/link';

export default function QCDashboard() {
    const { data: user } = useCurrentUser();
    const [stats, setStats] = useState({
        pending: 0,
        completedToday: 0,
        avgScore: 0,
    });
    const [pendingBatches, setPendingBatches] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch pending batches (status=pending)
                const response = await axiosInstance.get('/coffee', {
                    params: {
                        status: 'pending',
                        limit: 5,
                    }
                });

                if (response.data?.data?.data) {
                    setPendingBatches(response.data.data.data);
                    setStats({
                        pending: response.data.data.pagination.total || 0,
                        completedToday: 12, // Mock data for now
                        avgScore: 84.5, // Mock data for now
                    });
                }
            } catch (error) {
                console.error('Failed to fetch QC dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quality Control Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of grading tasks and quality metrics.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            Batches waiting for quality assessment
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Graded Today</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completedToday}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from yesterday
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Cupping Score</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgScore}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Batches List */}
            <Card className="col-span-3">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Pending Grading Tasks</CardTitle>
                            <CardDescription>
                                Batches that require quality assessment and grading.
                            </CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/qc/grading">View All</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : pendingBatches.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No pending batches found. Good job!
                            </div>
                        ) : (
                            pendingBatches.map((batch) => (
                                <div
                                    key={batch.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Batch #{batch.id.substring(0, 8)}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{batch.originLocation}</span>
                                                <span>•</span>
                                                <span>{batch.quantity} kg</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant="secondary">Pending</Badge>
                                        <Button size="sm" asChild>
                                            <Link href={`/qc/grading/${batch.id}`}>
                                                Grade Batch <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
