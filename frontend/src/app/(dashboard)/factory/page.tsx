'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Package,
    Truck,
    CheckCircle2,
    ArrowRight,
    QrCode,
    Factory,
    Search,
    Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function FactoryDashboard() {
    const [stats, setStats] = useState({
        readyToProcess: 0,
        processedToday: 0,
        nftsMinted: 0,
    });
    const [incomingBatches, setIncomingBatches] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch batches ready for processing (approved by QC)
                const response = await axiosInstance.get('/coffee', {
                    params: {
                        status: 'approved',
                        limit: 10,
                    }
                });

                if (response.data?.data?.data) {
                    setIncomingBatches(response.data.data.data);
                    setStats({
                        readyToProcess: response.data.data.pagination.total || 0,
                        processedToday: 12, // Mock data for demo
                        nftsMinted: 45, // Mock data for demo
                    });
                }
            } catch (error) {
                console.error('Failed to fetch factory dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const filteredBatches = incomingBatches.filter(batch =>
        batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.originLocation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 p-8 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Factory Operations</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage processing, packaging, and digital twin creation.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button>
                        <Factory className="mr-2 h-4 w-4" /> View Reports
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Ready to Process</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.readyToProcess}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +2 from yesterday
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Processed Today</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.processedToday}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            15,400 kg total volume
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">NFTs Minted</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <QrCode className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.nftsMinted}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            100% traceability coverage
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Incoming Inventory</CardTitle>
                            <CardDescription>
                                Batches approved by QC awaiting processing.
                            </CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search batches..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Batch ID</TableHead>
                                <TableHead>Origin</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Quality Score</TableHead>
                                <TableHead>Arrival Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Loading inventory...
                                    </TableCell>
                                </TableRow>
                            ) : filteredBatches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package className="h-8 w-8 text-slate-300" />
                                            <p className="font-medium text-slate-900">No approved batches yet</p>
                                            <p className="text-sm">Batches will appear here once approved by Quality Control.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBatches.map((batch) => (
                                    <TableRow key={batch.id} className="hover:bg-slate-50">
                                        <TableCell className="font-medium font-mono">
                                            #{batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>{batch.originLocation}</TableCell>
                                        <TableCell>{batch.quantity} kg</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal">
                                                {batch.grade || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-slate-700">
                                                {batch.quality?.match(/Score: (\d+)/)?.[1] || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(batch.updatedAt), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" asChild className="bg-slate-900 hover:bg-slate-800">
                                                <Link href={`/factory/process/${batch.id}`}>
                                                    Process <ArrowRight className="ml-2 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
