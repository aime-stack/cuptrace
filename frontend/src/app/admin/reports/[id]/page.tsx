'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, FileText, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ReportDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: report, isLoading } = useQuery({
        queryKey: ['report', id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/reports/${id}`);
            return data.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Report not found</p>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Reports
                </Button>
            </div>
        );
    }

    const { data: reportData } = report;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight capitalize">
                            {report.reportType.replace(/_/g, ' ')}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                            <Clock className="h-3 w-3" />
                            <span>Generated {format(new Date(report.createdAt), "MMM d, yyyy HH:mm")}</span>
                            <span>•</span>
                            <User className="h-3 w-3" />
                            <span>{report.generatedByUser?.name || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={
                        report.status === 'approved' ? 'default' : // default is roughly primary/black/dark
                            report.status === 'rejected' ? 'destructive' :
                                'secondary' // secondary is roughly gray/muted
                    }>
                        {report.status}
                    </Badge>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="summary" className="w-full">
                <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="batches">Batches</TabsTrigger>
                    <TabsTrigger value="regions">Regional Data</TabsTrigger>
                    <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>

                {/* Summary Tab */}
                <TabsContent value="summary" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportData?.summary?.totalQuantity?.total?.toLocaleString() || 0} kg
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Current period production
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Coffee Batches</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportData?.summary?.totalCoffeeBatches || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {reportData?.summary?.totalQuantity?.coffee?.toLocaleString() || 0} kg
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tea Batches</CardTitle>
                                <div className="h-4 w-4 rounded-full bg-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportData?.summary?.totalTeaBatches || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {reportData?.summary?.totalQuantity?.tea?.toLocaleString() || 0} kg
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Exports</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportData?.summary?.totalExports || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Completed shipments
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Batches Tab */}
                <TabsContent value="batches" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batches Included</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">List of batches aggregation would go here.</p>
                            {/* Simple list for now */}
                            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                                {[...(reportData?.batches?.coffee || []), ...(reportData?.batches?.tea || [])].map((batch: any) => (
                                    <div key={batch.id} className="flex justify-between p-2 border rounded text-sm">
                                        <span>{batch.lotId || batch.id.substring(0, 8)}</span>
                                        <Badge variant="outline">{batch.type}</Badge>
                                        <span>{batch.quantity}kg</span>
                                        <span>{batch.originLocation}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Regional Tab */}
                <TabsContent value="regions" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Regional Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(reportData?.byRegion || {}).map(([region, stats]: [string, any]) => (
                                    <div key={region} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="font-medium">{region}</div>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-amber-600">Coffee: {stats.coffee}kg</span>
                                            <span className="text-green-600">Tea: {stats.tea}kg</span>
                                            <span className="text-muted-foreground">{stats.batches} batches</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Raw Data Tab */}
                <TabsContent value="raw" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Raw JSON Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
                                {JSON.stringify(report, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
