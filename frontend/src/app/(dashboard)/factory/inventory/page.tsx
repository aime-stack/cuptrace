'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Package, Search, Download, Eye, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import Image from 'next/image';

export default function FactoryInventoryPage() {
    const [batches, setBatches] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await axiosInstance.get('/coffee', {
                    params: {
                        status: 'completed',
                        limit: 50,
                    }
                });

                if (response.data?.data) {
                    setBatches(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch inventory:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    const filteredBatches = batches.filter(batch =>
        batch.lotId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Factory Inventory</h1>
                <p className="text-muted-foreground">
                    Manage completed batches ready for export or distribution.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            Finished Goods
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading inventory...</div>
                    ) : filteredBatches.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                            <Package className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                            <p>No completed batches in inventory.</p>
                            <p className="text-sm">Process approved batches to add them here.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lot ID</TableHead>
                                    <TableHead>Origin</TableHead>
                                    <TableHead>Packaging</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Digital Twin</TableHead>
                                    <TableHead>QR Code</TableHead>
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
                                            <div className="flex flex-col text-sm">
                                                <span>{(batch.metadata?.packaging as any)?.type || 'Standard'}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(batch.metadata?.packaging as any)?.count || 1} x {(batch.metadata?.packaging as any)?.weight || 60}kg
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{batch.quantity} kg</TableCell>
                                        <TableCell>
                                            <Badge variant="default" className="bg-green-600">
                                                Ready
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {batch.nftPolicyId ? (
                                                <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                                                    <Award className="mr-1 h-3 w-3" />
                                                    Minted
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {batch.qrCodeUrl && (
                                                <div className="flex items-center gap-2">
                                                    <Image
                                                        src={batch.qrCodeUrl}
                                                        alt="QR"
                                                        width={32}
                                                        height={32}
                                                        className="rounded border"
                                                    />
                                                    <a
                                                        href={batch.qrCodeUrl}
                                                        target="_blank"
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        View
                                                    </a>
                                                </div>
                                            )}
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
