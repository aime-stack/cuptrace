'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft,
    Loader2,
    Package,
    QrCode,
    CheckCircle2,
    Wallet,
    FileText,
    Activity,
    MapPin,
    Calendar,
    Scale,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import { toast } from 'sonner';
import { connectWallet } from '@/lib/cardano/wallet';
import { mintBatchNFT } from '@/lib/cardano/mint';
import { format } from 'date-fns';

const processingSchema = z.object({
    packagingType: z.string().min(1, "Packaging type is required"),
    bagWeight: z.coerce.number().positive("Weight must be positive"),
    numberOfBags: z.coerce.number().int().positive("Number of bags must be positive"),
    roastLevel: z.string().optional(),
    notes: z.string().optional(),
});

type ProcessingFormData = z.infer<typeof processingSchema>;

export default function FactoryProcessPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [batch, setBatch] = useState<ProductBatch | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [minting, setMinting] = useState(false);
    const [minted, setMinted] = useState(false);

    const form = useForm<ProcessingFormData>({
        resolver: zodResolver(processingSchema),
        defaultValues: {
            packagingType: 'grain_pro',
            bagWeight: 60,
            numberOfBags: 1,
            roastLevel: 'green',
            notes: '',
        },
    });

    useEffect(() => {
        const fetchBatch = async () => {
            try {
                const response = await axiosInstance.get(`/coffee/${params.id}`);
                if (response.data?.data) {
                    setBatch(response.data.data);
                    if (response.data.data.nftPolicyId) {
                        setMinted(true);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch batch:', error);
                toast.error('Failed to load batch details');
            } finally {
                setLoading(false);
            }
        };

        fetchBatch();
    }, [params.id]);

    const handleLogEvent = async (eventType: string) => {
        try {
            await axiosInstance.post('/events', {
                batchId: params.id,
                eventType,
                description: `Batch ${eventType} at Factory`,
                metadata: { location: 'Kigali Factory' }
            });

            toast.success(`Event "${eventType}" logged`);
            // Refresh batch data
            const response = await axiosInstance.get(`/coffee/${params.id}`);
            if (response.data?.data) {
                setBatch(response.data.data);
            }
        } catch (error) {
            console.error('Failed to log event:', error);
            toast.error('Failed to log event');
        }
    };

    const handleUploadDocument = async (type: string, url: string) => {
        if (!url) {
            toast.error('Please enter a document URL');
            return;
        }
        try {
            await axiosInstance.post('/documents', {
                batchId: params.id,
                type,
                url
            });

            toast.success('Document attached');
            // Refresh batch data
            const response = await axiosInstance.get(`/coffee/${params.id}`);
            if (response.data?.data) {
                setBatch(response.data.data);
            }
            // Clear input
            const input = document.getElementById('doc-url') as HTMLInputElement;
            if (input) input.value = '';
        } catch (error) {
            console.error('Failed to upload document:', error);
            toast.error('Failed to attach document');
        }
    };

    const handleMintNFT = async () => {
        if (!batch) return;

        try {
            setMinting(true);
            const txHash = await mintBatchNFT(null, {
                id: batch.id,
                farmerId: batch.farmerId,
                integrityHash: batch.integrity?.hash || 'LEGACY_BATCH', // Fallback if no hash
                grade: batch.grade || 'Standard',
                weight: batch.quantity || 0,
                origin: batch.originLocation
            });

            // Update backend
            await axiosInstance.put(`/coffee/${batch.id}`, {
                metadata: {
                    ...batch.metadata,
                    nftMinted: true,
                    mintedAt: new Date().toISOString()
                }
            });

            // In a real app, we'd wait for block confirmation and store the PolicyID/AssetName properly
            // For now, we'll simulate the update
            toast.success('NFT Minting Transaction Submitted!');
            setMinted(true);

            // Refresh
            const response = await axiosInstance.get(`/coffee/${params.id}`);
            if (response.data?.data) {
                setBatch(response.data.data);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to mint NFT';
            console.error('Minting failed:', error);
            toast.error(errorMessage);
        } finally {
            setMinting(false);
        }
    };

    const onSubmit = async (data: ProcessingFormData) => {
        setSubmitting(true);
        try {
            await axiosInstance.put(`/coffee/${params.id}`, {
                status: 'completed',
                metadata: {
                    packaging: {
                        type: data.packagingType,
                        weight: data.bagWeight,
                        count: data.numberOfBags,
                        roast: data.roastLevel,
                        notes: data.notes
                    }
                }
            });
            toast.success('Batch processing completed');
            router.push('/factory');
        } catch (error) {
            console.error('Failed to process batch:', error);
            toast.error('Failed to update batch');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
        );
    }

    if (!batch) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50/50 dark:bg-background">
                <div className="bg-white dark:bg-card p-8 rounded-lg shadow-sm text-center max-w-md border">
                    <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-2">Batch Unavailable</h2>
                    <p className="text-muted-foreground mb-6">
                        We couldn&apos;t find the requested batch details. It may not be approved for processing yet.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/factory">Return to Inventory</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-background p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/factory">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
                            Process Batch #{batch.id.substring(0, 8)}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage events, documents, and digital twin.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={minted ? "default" : "outline"} className={minted ? "bg-indigo-600" : ""}>
                        {minted ? "Digital Twin Active" : "NFT Not Minted"}
                    </Badge>
                    <Badge variant="secondary">
                        {batch.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Sidebar: Batch Info */}
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-500">Batch Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Origin
                                </span>
                                <p className="font-medium text-sm">{batch.originLocation}</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Scale className="h-3 w-3" /> Quantity
                                </span>
                                <p className="font-medium text-sm">{batch.quantity} kg</p>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Activity className="h-3 w-3" /> Grade
                                </span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{batch.grade || 'N/A'}</Badge>
                                    <span className="text-sm font-medium">
                                        {batch.quality?.match(/Score: (\d+)/)?.[1] || '-'} pts
                                    </span>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Arrival
                                </span>
                                <p className="font-medium text-sm">
                                    {format(new Date(batch.updatedAt), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-slate-500">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {batch.events?.slice(0, 3).map((event: any) => (
                                    <div key={event.id} className="flex gap-3 text-sm">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                        <div>
                                            <p className="font-medium">{event.eventType}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(event.timestamp), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!batch.events || batch.events.length === 0) && (
                                    <p className="text-xs text-muted-foreground">No events yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Column: Actions */}
                <div className="lg:col-span-6 space-y-6">

                    {/* 1. Event Logging */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Batch hasn&apos;t started processing yetLog
                            </CardTitle>
                            <CardDescription>Record processing stages for traceability.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Select onValueChange={(val) => handleLogEvent(val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Activity..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Washed">Washing Station</SelectItem>
                                        <SelectItem value="Dried">Drying Bed</SelectItem>
                                        <SelectItem value="Milled">Dry Mill</SelectItem>
                                        <SelectItem value="Roasted">Roasting</SelectItem>
                                        <SelectItem value="Sorted">Color Sorting</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Full Event List */}
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border p-4 max-h-[200px] overflow-y-auto space-y-3">
                                {batch.events?.map((event: any) => (
                                    <div key={event.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <span className="font-medium">{event.eventType}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(event.timestamp), 'MMM d, HH:mm')}
                                        </span>
                                    </div>
                                ))}
                                {(!batch.events || batch.events.length === 0) && (
                                    <p className="text-sm text-center text-muted-foreground">No events recorded.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-orange-600" />
                                Documents
                            </CardTitle>
                            <CardDescription>Attach certificates and lab reports.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Document URL (https://...)"
                                    id="doc-url"
                                    className="flex-1"
                                />
                                <Select onValueChange={(val) => handleUploadDocument(val, (document.getElementById('doc-url') as HTMLInputElement).value)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Certificate">Certificate</SelectItem>
                                        <SelectItem value="LabReport">Lab Report</SelectItem>
                                        <SelectItem value="ICO">ICO Doc</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {batch.documents?.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center gap-2 p-2 border rounded bg-white text-sm">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{doc.type}</p>
                                            <a href={doc.url} target="_blank" className="text-xs text-blue-600 hover:underline truncate block">
                                                View Document
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Packaging Form */}
                    <Card className="border-t-4 border-t-slate-900 dark:border-t-slate-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-slate-900 dark:text-foreground" />
                                Final Packaging
                            </CardTitle>
                            <CardDescription>Enter final product details for export.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="packagingType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Packaging Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="grain_pro">GrainPro</SelectItem>
                                                            <SelectItem value="jute">Jute Bag</SelectItem>
                                                            <SelectItem value="vacuum">Vacuum Pack</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="numberOfBags"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bag Count</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="bagWeight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Weight per Bag (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="roastLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Roast Level</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select roast" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="green">Green (Raw)</SelectItem>
                                                            <SelectItem value="light">Light Roast</SelectItem>
                                                            <SelectItem value="medium">Medium Roast</SelectItem>
                                                            <SelectItem value="dark">Dark Roast</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={submitting}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Complete Processing
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar: Digital Twin */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                                <QrCode className="h-5 w-5" />
                                Digital Twin
                            </CardTitle>
                            <CardDescription className="text-indigo-700 dark:text-indigo-400">
                                Blockchain verification
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {minted ? (
                                <div className="space-y-3">
                                    <div className="bg-white dark:bg-card p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm">
                                            <CheckCircle2 className="h-4 w-4" /> Minted on Cardano
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-card p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
                                        <p className="text-xs text-muted-foreground mb-1">Asset ID</p>
                                        <p className="text-xs font-mono break-all text-slate-600">
                                            {batch.nftPolicyId?.substring(0, 12)}...
                                        </p>
                                    </div>
                                    <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100" asChild>
                                        <a href={`https://cardanoscan.io/transaction/${batch.blockchainTxHash}`} target="_blank" rel="noopener noreferrer">
                                            View on Explorer
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white/50 dark:bg-background/50 p-3 rounded text-sm text-indigo-800 dark:text-indigo-200">
                                        Mint a unique NFT for this batch to ensure traceability and authenticity.
                                    </div>
                                    <Button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                        onClick={handleMintNFT}
                                        disabled={minting}
                                    >
                                        {minting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Minting...
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="mr-2 h-4 w-4" /> Mint NFT
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Help & Support</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>Need to report an issue with this batch?</p>
                            <Button variant="outline" size="sm" className="w-full">
                                <AlertCircle className="mr-2 h-3 w-3" /> Report Issue
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
