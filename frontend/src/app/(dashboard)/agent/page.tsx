"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Loader2, Eye, Users, Package, TrendingUp, CheckCircle2, Clock, XCircle, QrCode, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBatches } from "@/hooks/useBatches";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAgentStats } from "@/hooks/useStats";
import { ProductType, ProductBatch } from "@/types";
import { StatsCardSkeleton } from "@/components/skeletons/StatsCardSkeleton";

export default function AgentDashboard() {
    const { data: user } = useCurrentUser();
    const { data: stats, isLoading: statsLoading } = useAgentStats();
    // Use useBatches only for the list view, ideally with pagination (default is 10)
    const { data: batchesData, isLoading: batchesLoading } = useBatches(
        { cooperativeId: user?.cooperativeId },
        ProductType.coffee,
        { enabled: !!user?.cooperativeId }
    );
    const [activeTab, setActiveTab] = useState<string>("all");

    const batches = useMemo(() => batchesData ?? [], [batchesData]);

    // Filter batches based on active tab - strictly for the list view
    const filteredBatches = useMemo(() => {
        switch (activeTab) {
            case 'pending':
                return batches.filter(b => b.status === 'pending');
            case 'approved':
                return batches.filter(b => b.status === 'approved');
            case 'rejected':
                return batches.filter(b => b.status === 'rejected');
            default:
                return batches;
        }
    }, [activeTab, batches]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
                    <p className="text-muted-foreground">
                        Here&apos;s what&apos;s happening with your farmers and batches today.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/agent/batches/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Register New Batch
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {statsLoading ? (
                    <>
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                        <StatsCardSkeleton />
                    </>
                ) : (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Today&apos;s Batches</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.todayBatches || 0}</div>
                                <p className="text-xs text-muted-foreground">Registered today</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                                <Clock className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pendingBatches || 0}</div>
                                <p className="text-xs text-muted-foreground">Awaiting QC approval</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Approved</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats?.approvedBatches || 0}</div>
                                <p className="text-xs text-green-600 dark:text-green-500">QR codes ready</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.totalBatches || 0}</div>
                                <p className="text-xs text-muted-foreground">All time</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Batches with Filter Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Batches</CardTitle>
                    <CardDescription>
                        Manage your registered batches and ensure quality control.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="all" className="gap-2">
                                All <Badge variant="secondary" className="ml-1">{stats?.totalBatches || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="gap-2">
                                <Clock className="h-3 w-3" />
                                Pending <Badge variant="secondary" className="ml-1">{stats?.pendingBatches || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="approved" className="gap-2">
                                <CheckCircle2 className="h-3 w-3" />
                                Approved <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">{stats?.approvedBatches || 0}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="rejected" className="gap-2">
                                <XCircle className="h-3 w-3" />
                                Rejected <Badge variant="secondary" className="ml-1">{stats?.rejectedBatches || 0}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab}>
                            {batchesLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredBatches.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No {activeTab === 'all' ? '' : activeTab} batches found.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Batch ID</TableHead>
                                            <TableHead>Farmer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>QR Code</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBatches.slice(0, 10).map((batch: ProductBatch) => (
                                            <TableRow key={batch.id}>
                                                <TableCell className="font-medium">
                                                    {batch.lotId || batch.id.substring(0, 8)}
                                                </TableCell>
                                                <TableCell>{batch.farmer?.name || "Unknown"}</TableCell>
                                                <TableCell>
                                                    {format(new Date(batch.createdAt), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell>{batch.quantity} kg</TableCell>
                                                <TableCell>
                                                    {batch.grade ? (
                                                        <Badge variant="outline">{batch.grade}</Badge>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        batch.status === 'approved' ? 'default' :
                                                            batch.status === 'rejected' ? 'destructive' :
                                                                'secondary'
                                                    } className={
                                                        batch.status === 'approved' ? 'bg-green-600' : ''
                                                    }>
                                                        {batch.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {batch.qrCodeUrl ? (
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={batch.qrCodeUrl} target="_blank" rel="noopener noreferrer">
                                                                <QrCode className="h-4 w-4 text-green-600" />
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/farmer/batches/${batch.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        {batch.publicTraceHash && (
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/trace/${batch.publicTraceHash}`}>
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
// Force recompile: Fixed typos and theming
