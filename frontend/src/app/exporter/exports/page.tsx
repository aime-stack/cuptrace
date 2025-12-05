'use client';

import { Ship, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as exportService from '@/services/export.service';
import { useQuery } from '@tanstack/react-query';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function ExportsPage() {
    const { data: exports, isLoading } = useQuery({
        queryKey: ['exports'],
        queryFn: () => exportService.listExports(),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exports</h1>
                    <p className="text-muted-foreground">
                        Manage export records
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Export
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Export Records</CardTitle>
                    <CardDescription>
                        All export records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !exports || exports.length === 0 ? (
                        <div className="text-center py-12">
                            <Ship className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No exports found</h3>
                            <p className="text-gray-500 mb-4">Create your first export record</p>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Export
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Export ID</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exports.map((exportRecord: any) => (
                                    <TableRow key={exportRecord.id}>
                                        <TableCell className="font-medium">{exportRecord.id.substring(0, 8)}</TableCell>
                                        <TableCell>{exportRecord.buyerName || 'N/A'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                exportRecord.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {exportRecord.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {exportRecord.shippingDate ? new Date(exportRecord.shippingDate).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost">View</Button>
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

