'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Search,
    ArrowRight,
    CheckCircle2,
    XCircle,
    ArrowLeft
} from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function QCHistoryPage() {
    const router = useRouter();
    const [batches, setBatches] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'approved' | 'rejected' | 'all'>('all');

    useEffect(() => {
        const fetchBatches = async () => {
            setLoading(true);
            try {
                // Fetch approved and rejected batches
                const statuses = statusFilter === 'all'
                    ? ['approved', 'rejected']
                    : [statusFilter];

                const promises = statuses.map(status =>
                    axiosInstance.get('/coffee', {
                        params: { status, search: searchTerm, limit: 50 }
                    })
                );

                const responses = await Promise.all(promises);
                const allBatches = responses.flatMap(r => r.data?.data?.data || []);

                // Sort by date descending (most recent first)
                allBatches.sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );

                setBatches(allBatches);
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchBatches, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Grading History</h1>
                    <p className="text-muted-foreground">
                        View previously graded batches.
                    </p>
                </div>
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
                        variant={statusFilter === 'all' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('all')}
                        size="sm"
                    >
                        All
                    </Button>
                    <Button
                        variant={statusFilter === 'approved' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('approved')}
                        size="sm"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approved
                    </Button>
                    <Button
                        variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                        onClick={() => setStatusFilter('rejected')}
                        size="sm"
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejected
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Loading history...</div>
                        ) : batches.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No graded batches found. Batches will appear here after being approved or rejected.
                            </div>
                        ) : (
                            batches.map((batch) => (
                                <div key={batch.id} className="p-4 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center ${batch.status === 'approved'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                            {batch.status === 'approved'
                                                ? <CheckCircle2 className="h-5 w-5" />
                                                : <XCircle className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">Batch #{batch.id.substring(0, 8)}</h3>
                                                <Badge variant={batch.status === 'approved' ? 'default' : 'destructive'}>
                                                    {batch.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                                <p>Origin: {batch.originLocation}</p>
                                                <p>Quantity: {batch.quantity} kg • Grade: {batch.grade || 'N/A'}</p>
                                                <p>Graded: {format(new Date(batch.updatedAt), 'PPP p')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {batch.quality && (
                                            <div className="text-right mr-4">
                                                <p className="text-xs text-muted-foreground">Quality</p>
                                                <p className="font-bold text-lg">{batch.quality}</p>
                                            </div>
                                        )}
                                        <Button variant="outline" asChild>
                                            <Link href={`/qc/grading/${batch.id}`}>
                                                View Details
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
