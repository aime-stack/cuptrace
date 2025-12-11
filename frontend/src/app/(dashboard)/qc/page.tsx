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
    QrCode,
    ExternalLink,
    Award
} from 'lucide-react';
import { useCurrentUser } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function QCDashboard() {
    const { data: user } = useCurrentUser();
    const [stats, setStats] = useState({
        pending: 0,
        approvedToday: 0,
        avgScore: 0,
    });
    const [pendingBatches, setPendingBatches] = useState<ProductBatch[]>([]);
    const [approvedBatches, setApprovedBatches] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch pending batches
                const pendingResponse = await axiosInstance.get('/coffee', {
                    params: { status: 'pending', limit: 5 }
                });

                // Fetch approved batches
                const approvedResponse = await axiosInstance.get('/coffee', {
                    params: { status: 'approved', limit: 5 }
                });

                if (pendingResponse.data?.data?.data) {
                    setPendingBatches(pendingResponse.data.data.data);
                }

                if (approvedResponse.data?.data?.data) {
                    setApprovedBatches(approvedResponse.data.data.data);
                }

                setStats({
                    pending: pendingResponse.data?.data?.pagination?.total || 0,
                    approvedToday: approvedResponse.data?.data?.pagination?.total || 0,
                    avgScore: 84.5,
                });
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
                <Card className="bg-green-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Approved</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{stats.approvedToday}</div>
                        <p className="text-xs text-green-600">
                            QR codes generated & ready
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

            {/* Approved Batches Section - NEW */}
            <Card className="col-span-3 border-green-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Recently Approved Batches
                            </CardTitle>
                            <CardDescription>
                                Batches with QR codes ready for factory processing.
                            </CardDescription>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/qc/history">View History</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : approvedBatches.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No approved batches yet.
                            </div>
                        ) : (
                            approvedBatches.map((batch) => (
                                <div
                                    key={batch.id}
                                    className="flex items-center justify-between p-4 border border-green-100 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {batch.lotId || `Batch #${batch.id.substring(0, 8)}`}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{batch.originLocation}</span>
                                                <span>•</span>
                                                <span>{batch.quantity} kg</span>
                                                {batch.grade && (
                                                    <>
                                                        <span>•</span>
                                                        <Badge variant="outline" className="text-green-700 border-green-300">
                                                            Grade {batch.grade}
                                                        </Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* QR Code Button */}
                                        {batch.qrCodeUrl ? (
                                            <Button size="sm" variant="outline" asChild>
                                                <a href={batch.qrCodeUrl} target="_blank" rel="noopener noreferrer">
                                                    <QrCode className="mr-2 h-4 w-4" />
                                                    View QR
                                                </a>
                                            </Button>
                                        ) : (
                                            <Badge variant="secondary">QR Pending</Badge>
                                        )}

                                        {/* NFT Badge */}
                                        {batch.nftPolicyId && (
                                            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                                <Award className="mr-1 h-3 w-3" />
                                                NFT Minted
                                            </Badge>
                                        )}

                                        {/* Trace Page Link */}
                                        {batch.publicTraceHash && (
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/trace/${batch.publicTraceHash}`}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
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
