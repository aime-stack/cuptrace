'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    Filter,
    ArrowRight,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function QCGradingListPage() {
    const [batches, setBatches] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');

    useEffect(() => {
        const fetchBatches = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/coffee', {
                    params: {
                        status: statusFilter === 'all' ? undefined : statusFilter,
                        search: searchTerm,
                        limit: 50,
                    }
                });

                if (response.data?.data?.data) {
                    setBatches(response.data.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch batches:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchBatches, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, statusFilter]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Grading Queue</h1>
                <p className="text-muted-foreground">
                    Manage and grade coffee batches.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Batch ID or Location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant={statusFilter === 'pending' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('pending')}
                        size="sm"
                    >
                        Pending
                    </Button>
                    <Button
                        variant={statusFilter === 'approved,rejected' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('approved,rejected')}
                        size="sm"
                    >
                        Graded
                    </Button>
                    <Button
                        variant={statusFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('all')}
                        size="sm"
                    >
                        All
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading batches...</div>
                        ) : batches.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No batches found matching your criteria.
                            </div>
                        ) : (
                            batches.map((batch) => (
                                <div key={batch.id} className="p-4 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center ${batch.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                            batch.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                            {batch.status === 'pending' ? <Clock className="h-5 w-5" /> :
                                                batch.status === 'approved' ? <CheckCircle2 className="h-5 w-5" /> :
                                                    <XCircle className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">Batch #{batch.id.substring(0, 8)}</h3>
                                                <Badge variant="outline">{batch.type}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                                <p>Origin: {batch.originLocation}</p>
                                                <p>Quantity: {batch.quantity} kg • Processing: {batch.processingType || 'N/A'}</p>
                                                <p>Date: {format(new Date(batch.createdAt), 'PPP')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {batch.quality && (
                                            <div className="text-right mr-4">
                                                <p className="text-xs text-muted-foreground">Quality Score</p>
                                                <p className="font-bold text-lg">{batch.quality}</p>
                                            </div>
                                        )}
                                        <Button asChild>
                                            <Link href={`/qc/grading/${batch.id}`}>
                                                {batch.status === 'pending' ? 'Grade Batch' : 'View Details'}
                                                <ArrowRight className="ml-2 h-4 w-4" />
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
