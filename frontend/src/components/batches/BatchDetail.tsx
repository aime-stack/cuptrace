'use client';

import { Package, MapPin, Calendar, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductBatch, BatchStatus, ProductType } from '@/types';
import { formatDate, getStatusColor, getStageLabel } from '@/lib/utils';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as batchService from '@/services/batch.service';

interface BatchDetailProps {
    batch: ProductBatch;
    isLoading?: boolean;
    showActions?: boolean;
    onEdit?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    productType?: ProductType;
}

export function BatchDetail({
    batch,
    isLoading = false,
    showActions = false,
    onEdit,
    onApprove,
    onReject,
    productType = ProductType.coffee
}: BatchDetailProps) {
    const [isMintingNFT, setIsMintingNFT] = useState(false);
    const [isCreatingBlockchain, setIsCreatingBlockchain] = useState(false);
    const queryClient = useQueryClient();

    const handleRetryMintNFT = async () => {
        setIsMintingNFT(true);
        try {
            const result = await batchService.retryMintNFT(batch.id, productType);
            console.log('NFT minted successfully:', result);
            // Refresh batch data
            queryClient.invalidateQueries({ queryKey: ['batch', batch.id] });
            alert('NFT minted successfully!');
        } catch (error) {
            console.error('Failed to mint NFT:', error);
            alert(error instanceof Error ? error.message : 'Failed to mint NFT');
        } finally {
            setIsMintingNFT(false);
        }
    };

    const handleRetryBlockchain = async () => {
        setIsCreatingBlockchain(true);
        try {
            const result = await batchService.retryBlockchainRecord(batch.id, productType);
            console.log('Blockchain record created successfully:', result);
            // Refresh batch data
            queryClient.invalidateQueries({ queryKey: ['batch', batch.id] });
            alert('Blockchain record created successfully!');
        } catch (error) {
            console.error('Failed to create blockchain record:', error);
            alert(error instanceof Error ? error.message : 'Failed to create blockchain record');
        } finally {
            setIsCreatingBlockchain(false);
        }
    };

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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">
                                {batch.lotId || `Batch #${batch.id.slice(0, 8)}`}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {batch.type.toUpperCase()} • {getStageLabel(batch.currentStage)}
                            </CardDescription>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize w-fit ${getStatusColor(batch.status)}`}>
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



                    {/* Blockchain & NFT Information */}
                    {(batch.blockchainTxHash || batch.nftPolicyId) && (
                        <div className="pt-4 border-t space-y-3">
                            <h3 className="text-sm font-medium text-gray-700">Blockchain & NFT</h3>

                            {batch.nftPolicyId && (
                                <div>
                                    <div className="flex items-center gap-2 text-green-700 mb-1">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-xs font-medium">NFT Minted</span>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <div>
                                            <span className="text-gray-500">Policy ID:</span>
                                            <p className="text-gray-700 font-mono break-all">{batch.nftPolicyId}</p>
                                        </div>
                                        {batch.nftAssetName && (
                                            <div>
                                                <span className="text-gray-500">Asset Name:</span>
                                                <p className="text-gray-700 font-mono break-all">{batch.nftAssetName}</p>
                                            </div>
                                        )}
                                        {batch.nftMintedAt && (
                                            <div>
                                                <span className="text-gray-500">Minted:</span>
                                                <p className="text-gray-700">{formatDate(batch.nftMintedAt)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {batch.blockchainTxHash && (
                                <div>
                                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="text-xs font-medium">Blockchain Record</span>
                                    </div>
                                    <p className="text-xs text-gray-600 font-mono break-all">
                                        {batch.blockchainTxHash}
                                    </p>
                                </div>
                            )}


                            {/* Retry buttons if operations failed */}
                            {(!batch.nftPolicyId || !batch.blockchainTxHash) && (
                                <div className="flex gap-2 pt-2">
                                    {!batch.nftPolicyId && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleRetryMintNFT}
                                            disabled={isMintingNFT}
                                            className="text-xs"
                                        >
                                            {isMintingNFT ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                    Minting...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-3 w-3 mr-1" />
                                                    Retry NFT Mint
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {!batch.blockchainTxHash && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleRetryBlockchain}
                                            disabled={isCreatingBlockchain}
                                            className="text-xs"
                                        >
                                            {isCreatingBlockchain ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-3 w-3 mr-1" />
                                                    Retry Blockchain Record
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )}
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

