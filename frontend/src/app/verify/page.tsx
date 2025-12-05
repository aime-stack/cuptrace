'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Package, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVerifyBatch } from '@/hooks/useBatches';
import { ProductType } from '@/types';
import { formatDate, getStageLabel } from '@/lib/utils';

export default function VerifyPage() {
    const [qrCode, setQrCode] = useState('');
    const [searchType, setSearchType] = useState<ProductType>(ProductType.coffee);
    const [hasSearched, setHasSearched] = useState(false);

    const { data: batch, isLoading, error, refetch } = useVerifyBatch(qrCode, searchType);

    const handleSearch = () => {
        if (qrCode.trim()) {
            setHasSearched(true);
            refetch();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-coffee-900">Verify Product</h1>
                    <p className="text-gray-600 text-sm">Track your coffee or tea from farm to cup</p>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                {/* Search Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Enter QR Code or Lot ID</CardTitle>
                        <CardDescription>
                            Scan the QR code on your product or enter the lot ID manually
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <select
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value as ProductType)}
                                className="px-4 py-2 border rounded-md"
                            >
                                <option value={ProductType.coffee}>Coffee</option>
                                <option value={ProductType.tea}>Tea</option>
                            </select>
                            <Input
                                placeholder="Enter QR code or lot ID..."
                                value={qrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={isLoading || !qrCode.trim()}>
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-coffee-600 mx-auto mb-4" />
                        <p className="text-gray-600">Verifying batch...</p>
                    </div>
                )}

                {/* Error State */}
                {hasSearched && error && !isLoading && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-8 text-center">
                            <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-red-900 mb-2">Batch Not Found</h3>
                            <p className="text-red-700">
                                No batch found with the provided QR code or lot ID. Please check and try again.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Success State - Batch Details */}
                {batch && !isLoading && (
                    <div className="space-y-6">
                        {/* Batch Overview */}
                        <Card className="border-green-200">
                            <CardHeader>
                                <div className="flex items-center gap-2 text-green-600 mb-2">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium">Verified Batch</span>
                                </div>
                                <CardTitle className="text-2xl">
                                    {batch.lotId || `Batch #${batch.id.slice(0, 8)}`}
                                </CardTitle>
                                <CardDescription>
                                    {batch.type.toUpperCase()} • {batch.status}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Origin</p>
                                            <p className="text-sm text-gray-600">{batch.originLocation}</p>
                                            {batch.region && <p className="text-xs text-gray-500">{batch.region}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Harvest Date</p>
                                            <p className="text-sm text-gray-600">
                                                {batch.harvestDate ? formatDate(batch.harvestDate) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {batch.description && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                                        <p className="text-sm text-gray-600">{batch.description}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                    {batch.quantity && (
                                        <div>
                                            <p className="text-xs text-gray-500">Quantity</p>
                                            <p className="text-sm font-medium">{batch.quantity} kg</p>
                                        </div>
                                    )}
                                    {batch.quality && (
                                        <div>
                                            <p className="text-xs text-gray-500">Quality</p>
                                            <p className="text-sm font-medium">{batch.quality}</p>
                                        </div>
                                    )}
                                    {batch.grade && (
                                        <div>
                                            <p className="text-xs text-gray-500">Grade</p>
                                            <p className="text-sm font-medium">{batch.grade}</p>
                                        </div>
                                    )}
                                    {batch.processingType && (
                                        <div>
                                            <p className="text-xs text-gray-500">Processing</p>
                                            <p className="text-sm font-medium capitalize">{batch.processingType}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Supply Chain Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Supply Chain Journey</CardTitle>
                                <CardDescription>Track the journey from farm to export</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-coffee-600 text-white flex items-center justify-center text-sm font-bold">
                                            ✓
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">Current Stage</p>
                                            <p className="text-sm text-gray-600">{getStageLabel(batch.currentStage)}</p>
                                        </div>
                                    </div>

                                    {batch.history && batch.history.length > 0 && (
                                        <div className="pl-4 border-l-2 border-gray-200 ml-4 space-y-4">
                                            {batch.history.map((record, index) => (
                                                <div key={record.id} className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{getStageLabel(record.stage)}</p>
                                                        <p className="text-sm text-gray-600">{formatDate(record.timestamp)}</p>
                                                        {record.notes && (
                                                            <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Blockchain Status */}
                        {batch.blockchainTxHash && (
                            <Card className="border-blue-200 bg-blue-50">
                                <CardContent className="py-4">
                                    <div className="flex items-center gap-2 text-blue-900">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium">Recorded on Cardano Blockchain</span>
                                    </div>
                                    <p className="text-sm text-blue-700 mt-2">
                                        Transaction: {batch.blockchainTxHash}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
