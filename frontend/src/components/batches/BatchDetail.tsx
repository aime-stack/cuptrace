'use client';

import { Package, MapPin, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductBatch, BatchStatus } from '@/types';
import { formatDate, getStatusColor, getStageLabel } from '@/lib/utils';

interface BatchDetailProps {
    batch: ProductBatch;
    isLoading?: boolean;
    showActions?: boolean;
    onEdit?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
}

export function BatchDetail({ 
    batch, 
    isLoading = false,
    showActions = false,
    onEdit,
    onApprove,
    onReject 
}: BatchDetailProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Batch Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">
                                {batch.lotId || `Batch #${batch.id.slice(0, 8)}`}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {batch.type.toUpperCase()} • {getStageLabel(batch.currentStage)}
                            </CardDescription>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(batch.status)}`}>
                            {batch.status.replace('_', ' ')}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Origin Location</p>
                                <p className="text-sm text-gray-600">{batch.originLocation}</p>
                                {batch.region && (
                                    <p className="text-xs text-gray-500">
                                        {[batch.region, batch.district, batch.sector].filter(Boolean).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Harvest Date</p>
                                <p className="text-sm text-gray-600">
                                    {batch.harvestDate ? formatDate(batch.harvestDate) : 'N/A'}
                                </p>
                                {batch.type === 'tea' && batch.pluckingDate && (
                                    <p className="text-xs text-gray-500">
                                        Plucked: {formatDate(batch.pluckingDate)}
                                    </p>
                                )}
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
                        {batch.moisture && (
                            <div>
                                <p className="text-xs text-gray-500">Moisture</p>
                                <p className="text-sm font-medium">{batch.moisture}%</p>
                            </div>
                        )}
                        {batch.processingType && (
                            <div>
                                <p className="text-xs text-gray-500">Processing</p>
                                <p className="text-sm font-medium capitalize">{batch.processingType}</p>
                            </div>
                        )}
                        {batch.type === 'tea' && batch.teaType && (
                            <div>
                                <p className="text-xs text-gray-500">Tea Type</p>
                                <p className="text-sm font-medium capitalize">{batch.teaType}</p>
                            </div>
                        )}
                    </div>

                    {batch.coordinates && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Coordinates</p>
                            <p className="text-sm text-gray-600 font-mono">{batch.coordinates}</p>
                        </div>
                    )}

                    {batch.tags && batch.tags.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {batch.tags.map((tag, index) => (
                                    <span key={index} className="inline-flex items-center rounded-md border border-gray-300 px-2 py-1 text-xs font-medium bg-white text-gray-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {batch.blockchainTxHash && (
                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-2 text-blue-900">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium text-sm">Recorded on Blockchain</span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1 font-mono break-all">
                                {batch.blockchainTxHash}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions (if needed) */}
            {showActions && (onEdit || onApprove || onReject) && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex gap-2">
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Edit Batch
                                </button>
                            )}
                            {batch.status === BatchStatus.pending && onApprove && (
                                <button
                                    onClick={onApprove}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    Approve
                                </button>
                            )}
                            {batch.status === BatchStatus.pending && onReject && (
                                <button
                                    onClick={onReject}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

