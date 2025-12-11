'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Coffee,
    MapPin,
    Calendar,
    CheckCircle,
    Shield,
    Package,
    ArrowLeft,
    ExternalLink,
    Loader2,
    Leaf,
    Award,
    Clock,
    QrCode
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { axiosInstance } from '@/lib/axios';

interface TraceData {
    publicTraceHash: string;
    lotId?: string;
    type: 'coffee' | 'tea';
    status: string;
    origin: {
        region?: string;
        country: string;
    };
    product: {
        grade?: string;
        quality?: string;
        processingType?: string;
        teaType?: string;
        quantity?: number;
        harvestDate?: string;
    };
    farmer?: {
        displayName: string;
        publicHash?: string;
    };
    cooperative?: {
        name: string;
        region?: string;
    };
    qc: {
        isApproved: boolean;
        qrCodeUrl?: string;
    };
    blockchain: {
        txHash?: string;
        nftPolicyId?: string;
        nftAssetName?: string;
        nftMintedAt?: string;
    };
    timeline: Array<{
        id: string;
        stage: string;
        timestamp: string;
        notes?: string;
    }>;
    events: Array<{
        id: string;
        type: string;
        timestamp: string;
        description?: string;
        location?: string;
    }>;
    certificates: Array<{
        id: string;
        certificateType: string;
        certificateNumber: string;
        issuedBy: string;
        issuedDate: string;
        expiryDate?: string;
    }>;
    description?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function getStageLabel(stage: string): string {
    const labels: Record<string, string> = {
        farmer: 'Farmer Harvest',
        washing_station: 'Washing Station',
        factory: 'Factory Processing',
        exporter: 'Export Ready',
        importer: 'Imported',
        retailer: 'Retail',
    };
    return labels[stage] || stage;
}

function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        processing: 'bg-blue-100 text-blue-800',
        completed: 'bg-emerald-100 text-emerald-800',
        exported: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

export default function TracePage() {
    const params = useParams();
    const publicHash = params.publicHash as string;

    const [traceData, setTraceData] = useState<TraceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTraceData = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/api/trace/${publicHash}`);
                if (response.data?.success) {
                    setTraceData(response.data.data);
                } else {
                    setError('Failed to load trace data');
                }
            } catch (err) {
                console.error('Error fetching trace:', err);
                setError('Product not found or invalid trace code');
            } finally {
                setLoading(false);
            }
        };

        if (publicHash) {
            fetchTraceData();
        }
    }, [publicHash]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-coffee-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading product trace...</p>
                </div>
            </div>
        );
    }

    if (error || !traceData) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-12 text-center">
                            <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-red-900 mb-2">Product Not Found</h2>
                            <p className="text-red-700 mb-6">
                                {error || 'The trace code you entered is not valid or the product could not be found.'}
                            </p>
                            <Link href="/">
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const ProductIcon = traceData.type === 'coffee' ? Coffee : Leaf;

    return (
        <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-white">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Coffee className="h-8 w-8 text-coffee-600" />
                        <span className="text-2xl font-bold text-coffee-900">CupTrace</span>
                    </Link>
                    <Badge variant="outline" className="text-coffee-600 border-coffee-300">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Product
                    </Badge>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Link */}
                <Link href="/" className="inline-flex items-center text-gray-600 hover:text-coffee-600 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                </Link>

                {/* Verification Banner */}
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 mb-6">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-green-900">
                                    Verified {traceData.type === 'coffee' ? 'Coffee' : 'Tea'} Product
                                </h1>
                                <p className="text-green-700">
                                    Trace ID: {traceData.publicTraceHash}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Product Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ProductIcon className="h-5 w-5 text-coffee-600" />
                                Product Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Lot ID</span>
                                <span className="font-mono font-medium">{traceData.lotId || traceData.publicTraceHash}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Type</span>
                                <Badge>{traceData.type.toUpperCase()}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Status</span>
                                <Badge className={getStatusColor(traceData.status)}>
                                    {traceData.status}
                                </Badge>
                            </div>
                            {traceData.product.grade && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Grade</span>
                                    <span className="font-medium">{traceData.product.grade}</span>
                                </div>
                            )}
                            {traceData.product.quantity && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Quantity</span>
                                    <span className="font-medium">{traceData.product.quantity} kg</span>
                                </div>
                            )}
                            {traceData.product.processingType && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Processing</span>
                                    <span className="font-medium capitalize">{traceData.product.processingType}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Origin Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-coffee-600" />
                                Origin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Country</span>
                                <span className="font-medium">{traceData.origin.country}</span>
                            </div>
                            {traceData.origin.region && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Region</span>
                                    <span className="font-medium">{traceData.origin.region}</span>
                                </div>
                            )}
                            {traceData.farmer && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Producer</span>
                                    <span className="font-medium">{traceData.farmer.displayName}</span>
                                </div>
                            )}
                            {traceData.cooperative && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Cooperative</span>
                                    <span className="font-medium">{traceData.cooperative.name}</span>
                                </div>
                            )}
                            {traceData.product.harvestDate && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Harvest Date</span>
                                    <span className="font-medium">{formatDate(traceData.product.harvestDate)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* QR Code */}
                {traceData.qc.qrCodeUrl && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5 text-coffee-600" />
                                Product QR Code
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <img
                                src={traceData.qc.qrCodeUrl}
                                alt="Product QR Code"
                                className="w-48 h-48 border rounded-lg shadow-sm"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Timeline */}
                {traceData.timeline.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-coffee-600" />
                                Supply Chain Journey
                            </CardTitle>
                            <CardDescription>Track the complete journey from farm to cup</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {traceData.timeline.map((item, index) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-coffee-600 text-white' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            {index < traceData.timeline.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 my-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-medium">{getStageLabel(item.stage)}</p>
                                            <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                                            {item.notes && (
                                                <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Certifications */}
                {traceData.certificates.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-coffee-600" />
                                Certifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {traceData.certificates.map((cert) => (
                                    <div key={cert.id} className="p-4 border rounded-lg">
                                        <p className="font-medium capitalize">{cert.certificateType.replace('_', ' ')}</p>
                                        <p className="text-sm text-gray-500">#{cert.certificateNumber}</p>
                                        <p className="text-sm text-gray-500">Issued by: {cert.issuedBy}</p>
                                        <p className="text-sm text-gray-500">{formatDate(cert.issuedDate)}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Blockchain Info */}
                {traceData.blockchain.nftPolicyId && (
                    <Card className="mt-6 border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <Shield className="h-5 w-5" />
                                Blockchain Verification
                            </CardTitle>
                            <CardDescription className="text-blue-700">
                                This product is verified on the Cardano blockchain
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-blue-700">NFT Policy ID</p>
                                <p className="font-mono text-sm text-blue-900 break-all">
                                    {traceData.blockchain.nftPolicyId}
                                </p>
                            </div>
                            {traceData.blockchain.txHash && (
                                <div>
                                    <p className="text-sm text-blue-700">Transaction Hash</p>
                                    <a
                                        href={`https://preprod.cardanoscan.io/transaction/${traceData.blockchain.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1"
                                    >
                                        {traceData.blockchain.txHash.substring(0, 20)}...
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            )}
                            {traceData.blockchain.nftMintedAt && (
                                <div>
                                    <p className="text-sm text-blue-700">Minted On</p>
                                    <p className="text-sm text-blue-900">{formatDate(traceData.blockchain.nftMintedAt)}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>Verified by CupTrace - Blockchain-powered traceability</p>
                    <p className="mt-1">© 2025 CupTrace Team</p>
                </div>
            </div>
        </div>
    );
}
