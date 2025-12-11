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
    Filter,
    Download,
    Eye,
    Award,
    FileCheck
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

export default function FactoryDashboard() {
    const [stats, setStats] = useState({
        readyToProcess: 0,
        withQRCodes: 0,
        nftsMinted: 0,
    });
    const [incomingBatches, setIncomingBatches] = useState<ProductBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [generatingQR, setGeneratingQR] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axiosInstance.get('/coffee', {
                    params: {
                        status: 'approved',
                        limit: 20,
                    }
                });

                if (response.data?.data?.data) {
                    const batches = response.data.data.data;
                    setIncomingBatches(batches);

                    const withQR = batches.filter((b: ProductBatch) => b.qrCodeUrl);
                    const withNFT = batches.filter((b: ProductBatch) => b.nftPolicyId);

                    setStats({
                        readyToProcess: response.data.data.pagination.total || 0,
                        withQRCodes: withQR.length,
                        nftsMinted: withNFT.length,
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
        batch.originLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.lotId && batch.lotId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleGenerateQR = async (batchId: string) => {
        setGeneratingQR(batchId);
        try {
            const response = await axiosInstance.post(`/api/batches/${batchId}/generate-qr`);
            if (response.data?.success) {
                // Refresh the batch list
                const updatedBatches = incomingBatches.map(b =>
                    b.id === batchId
                        ? { ...b, qrCodeUrl: response.data.data.qrCodeUrl, publicTraceHash: response.data.data.publicTraceHash }
                        : b
                );
                setIncomingBatches(updatedBatches);
            }
        } catch (error) {
            console.error('Failed to generate QR code:', error);
        } finally {
            setGeneratingQR(null);
        }
    };

    return (
        <div className="space-y-8 p-8 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Factory Operations</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage processing, QR codes, and digital twin creation.
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
                        <p className="text-xs text-muted-foreground">
                            Approved batches
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">QR Codes Generated</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <QrCode className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{stats.withQRCodes}</div>
                        <p className="text-xs text-green-600">
                            Ready for packaging
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">NFTs Minted</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Award className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{stats.nftsMinted}</div>
                        <p className="text-xs text-purple-600">
                            Blockchain verified
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Incoming Batches with QR Codes */}
            <Card className="bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Approved Batches - QR Management
                            </CardTitle>
                            <CardDescription>
                                Generate and download QR codes for approved batches.
                            </CardDescription>
                        </div>
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
                        <div className="text-center py-8 text-muted-foreground">
                            No approved batches found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lot ID</TableHead>
                                    <TableHead>Origin</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>NFT</TableHead>
                                    <TableHead>QR Code</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBatches.map((batch) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>{batch.originLocation}</TableCell>
                                        <TableCell>{batch.quantity} kg</TableCell>
                                        <TableCell>
                                            {batch.grade ? (
                                                <Badge variant="outline">{batch.grade}</Badge>
                                            ) : '-'}
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
                                            {batch.qrCodeUrl ? (
                                                <div className="flex items-center gap-2">
                                                    {/* QR Thumbnail */}
                                                    <img
                                                        src={batch.qrCodeUrl}
                                                        alt="QR Code"
                                                        className="h-10 w-10 rounded border"
                                                    />
                                                    <div className="flex flex-col gap-1">
                                                        <a
                                                            href={batch.qrCodeUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <Eye className="h-3 w-3" /> View
                                                        </a>
                                                        <a
                                                            href={batch.qrCodeUrl}
                                                            download={`qr-${batch.lotId || batch.id}.png`}
                                                            className="text-xs text-green-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <Download className="h-3 w-3" /> Download
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleGenerateQR(batch.id)}
                                                    disabled={generatingQR === batch.id}
                                                >
                                                    {generatingQR === batch.id ? (
                                                        'Generating...'
                                                    ) : (
                                                        <>
                                                            <QrCode className="mr-2 h-4 w-4" />
                                                            Generate QR
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/factory/process/${batch.id}`}>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {batch.publicTraceHash && (
                                                    <Button size="sm" variant="ghost" asChild>
                                                        <Link href={`/trace/${batch.publicTraceHash}`}>
                                                            <FileCheck className="h-4 w-4" />
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
                </CardContent>
            </Card>
        </div>
    );
}
