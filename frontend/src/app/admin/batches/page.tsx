'use client';

import { Package, Loader2, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBatches, useApproveBatch, useRejectBatch } from '@/hooks/useBatches';
import { ProductType, BatchStatus } from '@/types';
import { getStatusColor } from '@/lib/utils';
import { toast } from 'sonner';
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
    const { mutate: approveBatch, isPending: isApproving } = useApproveBatch();
    const { mutate: rejectBatch, isPending: isRejecting } = useRejectBatch();

    const handleApprove = (id: string) => {
        if (confirm('Are you sure you want to approve this batch?')) {
            approveBatch(id);
        }
    };

    const handleReject = (id: string) => {
        const reason = prompt('Please enter a reason for rejection:');
        if (reason) {
            rejectBatch({ id, reason });
        }
    };

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
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {batches.map((batch: any) => (
                                    <div key={batch.id} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="font-semibold">{batch.type}</p>
                                                <p className="text-xs text-muted-foreground">ID: {batch.lotId || batch.id.substring(0, 8)}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(batch.status)}`}>
                                                {batch.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                            <div>
                                                <p className="text-muted-foreground text-xs">Farmer</p>
                                                <p className="font-medium truncate">{batch.farmerId || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Date</p>
                                                <p className="font-medium">{format(new Date(batch.createdAt), "MMM d, yyyy")}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground text-xs">Quantity</p>
                                                <p className="font-medium">{batch.quantity || 0} kg</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {batch.status === BatchStatus.pending ? (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleApprove(batch.id)}
                                                        disabled={isApproving || isRejecting}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                                        onClick={() => handleReject(batch.id)}
                                                        disabled={isApproving || isRejecting}
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="outline" className="w-full">View Details</Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Batch ID</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Farmer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
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
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(batch.createdAt), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell>{batch.quantity || 0} kg</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 text-xs rounded-full border whitespace-nowrap ${getStatusColor(batch.status)}`}>
                                                        {batch.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        {batch.status === BatchStatus.pending && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    onClick={() => handleApprove(batch.id)}
                                                                    disabled={isApproving || isRejecting}
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleReject(batch.id)}
                                                                    disabled={isApproving || isRejecting}
                                                                >
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
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

