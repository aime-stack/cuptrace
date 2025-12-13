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
import { Settings, ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function FactoryProcessingPage() {
    const [batches, setBatches] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProcessing = async () => {
            try {
                // Fetch approved batches (Ready to Process)
                const response = await axiosInstance.get('/coffee', {
                    params: {
                        status: 'approved',
                        limit: 50,
                    }
                });

                if (response.data?.data) {
                    setBatches(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch processing batches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProcessing();
    }, []);

    const filteredBatches = batches.filter(batch =>
        batch.lotId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Processing Floor</h1>
                <p className="text-muted-foreground">
                    Manage active batches and production lines.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-orange-600" />
                            Ready for Processing
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search batches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredBatches.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No batches available for processing.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lot ID</TableHead>
                                    <TableHead>Origin</TableHead>
                                    <TableHead>Harvest Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBatches.map((batch) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>{batch.originLocation}</TableCell>
                                        <TableCell>
                                            {batch.harvestDate ? format(new Date(batch.harvestDate), 'MMM d, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell>{batch.quantity} kg</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{batch.grade || 'Std'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" asChild>
                                                <Link href={`/factory/process/${batch.id}`}>
                                                    Process <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
