'use client';

import { Package, Loader2, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBatches } from '@/hooks/useBatches';
import { ProductType, BatchStatus } from '@/types';
import { getStatusColor } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

export default function AdminBatchesPage() {
    const { data: batches, isLoading } = useBatches({}, ProductType.coffee);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
                <p className="text-muted-foreground">
                    Review and manage all batches in the system
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Batches</CardTitle>
                    <CardDescription>
                        Approve or reject pending batches
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !batches || batches.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
                            <p className="text-gray-500 mb-4">No batches have been registered yet</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Farmer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell className="capitalize">{batch.type}</TableCell>
                                        <TableCell>{batch.farmerId || 'N/A'}</TableCell>
                                        <TableCell>
                                            {format(new Date(batch.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{batch.quantity || 0} kg</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(batch.status)}`}>
                                                {batch.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {batch.status === BatchStatus.pending && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="gap-2">
                                                            <CheckCircle className="h-4 w-4" />
                                                            Approve
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="gap-2">
                                                            <X className="h-4 w-4" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                <Button size="sm" variant="ghost">View</Button>
                                            </div>
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

