'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle2,
    MapPin,
    Calendar,
    Package,
    Truck,
    Factory,
    Coffee,
    Award,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { format } from 'date-fns';

export default function VerifyPage() {
    const params = useParams();
    const id = params.id as string;

    const [batch, setBatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'verified' | 'warning' | 'invalid'>('verified');
    const [verificationIssues, setVerificationIssues] = useState<string[]>([]);

    useEffect(() => {
        const fetchBatchData = async () => {
            try {
                const response = await axiosInstance.get(`/coffee/${id}/verify`);
                if (response.data?.data) {
                    const { batch, verificationResult } = response.data.data;
                    setBatch(batch);

                    if (verificationResult && !verificationResult.isValid) {
                        setVerificationStatus('warning');
                        setVerificationIssues(verificationResult.issues);
                    } else {
                        setVerificationStatus('verified');
                        setVerificationIssues([]);
                    }
                }
            } catch (err) {
                console.error('Verification failed:', err);
                setError('Batch not found or verification failed.');
                setVerificationStatus('invalid');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBatchData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-coffee-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Verifying authenticity...</p>
                </div>
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Card className="w-full max-w-md border-red-200 bg-red-50">
                    <CardHeader className="text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                        <CardTitle className="text-red-700">Verification Failed</CardTitle>
                        <CardDescription className="text-red-600">
                            {error || "We couldn't verify this product's authenticity."}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header / Status */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">Authentic Rwandan Coffee</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900">Batch #{batch.id.substring(0, 8)}</h1>
                    <p className="text-lg text-slate-600">
                        Verified on Cardano Blockchain
                    </p>
                </div>

                {/* Integrity Check */}
                <Card className={`${verificationStatus === 'verified' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${verificationStatus === 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {verificationStatus === 'verified' ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">
                                    {verificationStatus === 'verified' ? 'Data Integrity Verified' : 'Verification Warning'}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {verificationStatus === 'verified'
                                        ? 'The data for this batch matches the immutable record on the Cardano blockchain.'
                                        : 'There are discrepancies between the current data and the blockchain record.'}
                                </p>
                                {batch.integrity && (
                                    <div className="bg-white/50 p-2 rounded text-xs font-mono text-slate-500 break-all">
                                        Hash: {batch.integrity.hash}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Info Card */}
                <Card className="border-t-4 border-t-coffee-600 shadow-lg">
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> Origin
                            </span>
                            <p className="font-medium text-lg">{batch.originLocation}</p>
                            <p className="text-sm text-muted-foreground">{batch.region}, Rwanda</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Award className="h-3 w-3" /> Grade & Quality
                            </span>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-base">{batch.grade || 'Standard'}</Badge>
                                <span className="font-medium">Score: {batch.quality?.match(/Score: (\d+)/)?.[1] || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Harvest Date
                            </span>
                            <p className="font-medium">
                                {batch.harvestDate ? format(new Date(batch.harvestDate), 'MMMM yyyy') : 'N/A'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Coffee className="h-3 w-3" /> Processing
                            </span>
                            <p className="font-medium capitalize">{batch.processingType || 'Washed'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Supply Chain Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Journey Timeline</CardTitle>
                        <CardDescription>From farm to cup, fully traceable.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
                            {/* Farm Stage */}
                            <div className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-100" />
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-slate-900">Harvested at Origin</h3>
                                    <p className="text-sm text-slate-500">
                                        {batch.harvestDate ? format(new Date(batch.harvestDate), 'MMM d, yyyy') : 'Date N/A'}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        Harvested by {batch.farmer?.name || 'Local Farmer'} in {batch.originLocation}.
                                    </p>
                                </div>
                            </div>

                            {/* Washing Station */}
                            <div className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100" />
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-slate-900">Processed at Washing Station</h3>
                                    <p className="text-sm text-slate-500">
                                        {batch.createdAt ? format(new Date(batch.createdAt), 'MMM d, yyyy') : 'Date N/A'}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        Received and processed at {batch.washingStation?.name || 'Station'}.
                                    </p>
                                </div>
                            </div>

                            {/* QC */}
                            {batch.quality && (
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-purple-500 border-2 border-white ring-2 ring-purple-100" />
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-slate-900">Quality Certified</h3>
                                        <p className="text-sm text-slate-600">
                                            Graded {batch.grade} with score {batch.quality?.match(/Score: (\d+)/)?.[1]}.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Dynamic Events */}
                            {batch.events?.map((event: any) => (
                                <div key={event.id} className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-orange-500 border-2 border-white ring-2 ring-orange-100" />
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-slate-900">{event.eventType}</h3>
                                        <p className="text-sm text-slate-500">
                                            {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {event.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Operator: {event.operator?.name}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Factory / NFT */}
                            {batch.nftPolicyId && (
                                <div className="relative pl-8">
                                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-indigo-500 border-2 border-white ring-2 ring-indigo-100" />
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-slate-900">Digital Twin Minted</h3>
                                        <p className="text-sm text-slate-500">
                                            {batch.metadata?.mintedAt ? format(new Date(batch.metadata.mintedAt), 'MMM d, yyyy') : 'Date N/A'}
                                        </p>
                                        <div className="bg-slate-100 p-3 rounded-md text-xs font-mono break-all mt-2">
                                            <span className="font-bold text-slate-500 block mb-1">Asset ID:</span>
                                            {batch.nftPolicyId}.{batch.nftAssetName}
                                        </div>
                                        <a
                                            href={`https://cardanoscan.io/transaction/${batch.blockchainTxHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-600 hover:underline inline-block mt-1"
                                        >
                                            View on Blockchain Explorer →
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Section */}
                {batch.documents && batch.documents.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents & Certificates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {batch.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{doc.type}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-blue-600 hover:underline"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
