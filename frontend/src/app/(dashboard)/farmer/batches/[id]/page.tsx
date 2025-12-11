"use client";

import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Package,
    QrCode,
    Share2,
    Loader2,
    Edit,
    CheckCircle2,
    Circle,
    Truck,
    Factory,
    Ship,
    Store,
    Award,
    ExternalLink,
    Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBatch } from "@/hooks/useBatches";
import { ProductType } from "@/types";
import Link from "next/link";

// Supply chain stages in order
const SUPPLY_CHAIN_STAGES = [
    { key: 'farmer', label: 'Farmer', icon: Package, description: 'Harvested' },
    { key: 'washing_station', label: 'Washing Station', icon: Factory, description: 'Washed & Dried' },
    { key: 'factory', label: 'Factory', icon: Factory, description: 'Processed & Packed' },
    { key: 'exporter', label: 'Exporter', icon: Ship, description: 'Ready for Export' },
    { key: 'importer', label: 'Importer', icon: Truck, description: 'Imported' },
    { key: 'retailer', label: 'Retailer', icon: Store, description: 'Ready for Sale' },
];

function getStageIndex(stage: string): number {
    return SUPPLY_CHAIN_STAGES.findIndex(s => s.key === stage);
}

export default function BatchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: batch, isLoading, error } = useBatch(id, ProductType.coffee);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Package className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Batch not found</h2>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    const currentStageIndex = getStageIndex(batch.currentStage || 'farmer');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Batch #{batch.lotId || batch.id.substring(0, 8)}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="capitalize">{batch.type}</span>
                            <span>•</span>
                            <span>Created {format(new Date(batch.createdAt), "PPP")}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {batch.publicTraceHash && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/trace/${batch.publicTraceHash}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Public Trace
                            </Link>
                        </Button>
                    )}
                    <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Supply Chain Stage Tracker */}
            <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-green-600" />
                        Supply Chain Progress
                    </CardTitle>
                    <CardDescription>
                        Track where your batch is in the supply chain
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded">
                            <div
                                className="h-full bg-green-500 rounded transition-all duration-500"
                                style={{
                                    width: `${Math.min(100, ((currentStageIndex + 1) / SUPPLY_CHAIN_STAGES.length) * 100)}%`
                                }}
                            />
                        </div>

                        {/* Stage Icons */}
                        <div className="relative flex justify-between">
                            {SUPPLY_CHAIN_STAGES.map((stage, index) => {
                                const isCompleted = index <= currentStageIndex;
                                const isCurrent = index === currentStageIndex;
                                const Icon = stage.icon;

                                return (
                                    <div key={stage.key} className="flex flex-col items-center w-20">
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center z-10
                                            transition-all duration-300
                                            ${isCompleted
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-400'}
                                            ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}
                                        `}>
                                            {isCompleted && !isCurrent ? (
                                                <CheckCircle2 className="h-6 w-6" />
                                            ) : (
                                                <Icon className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span className={`
                                            text-xs mt-2 font-medium text-center
                                            ${isCurrent ? 'text-green-700' : isCompleted ? 'text-green-600' : 'text-gray-400'}
                                        `}>
                                            {stage.label}
                                        </span>
                                        {isCurrent && (
                                            <Badge className="mt-1 bg-green-600 text-xs">
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">QC Status</span>
                                    <div>
                                        <Badge variant={
                                            batch.status === 'approved' ? 'default' :
                                                batch.status === 'rejected' ? 'destructive' :
                                                    'secondary'
                                        } className={
                                            batch.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''
                                        }>
                                            {batch.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">NFT Status</span>
                                    <div>
                                        {batch.nftPolicyId ? (
                                            <Badge className="bg-purple-100 text-purple-700">
                                                <Award className="mr-1 h-3 w-3" />
                                                Minted
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Pending</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Grade</span>
                                    <p className="font-bold text-lg">{batch.grade || "Pending"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Batch Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Details</CardTitle>
                            <CardDescription>Core information about this harvest</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Quantity</span>
                                    <p className="font-medium">{batch.quantity} kg</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Harvest Date</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p>{batch.harvestDate ? format(new Date(batch.harvestDate), "PPP") : "N/A"}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Origin</span>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <p>{batch.originLocation}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Processing</span>
                                    <p className="capitalize">{batch.processingType || "N/A"}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Moisture</span>
                                    <p>{batch.moisture ? `${batch.moisture}%` : "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Quality</span>
                                    <p>{batch.quality || "N/A"}</p>
                                </div>
                            </div>

                            {batch.description && (
                                <>
                                    <Separator />
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">Notes</span>
                                        <p className="text-sm text-muted-foreground">{batch.description}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline / History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                            <CardDescription>Timeline of events for this batch</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l border-muted pl-6 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-primary" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Batch Created</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(batch.createdAt), "PPP p")}
                                        </p>
                                    </div>
                                </div>
                                {batch.status === 'approved' && (
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-green-500" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none text-green-700">QC Approved</p>
                                            <p className="text-sm text-muted-foreground">
                                                Grade: {batch.grade || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {batch.nftPolicyId && (
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-purple-500" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none text-purple-700">NFT Minted</p>
                                            <p className="text-sm text-muted-foreground font-mono text-xs truncate">
                                                {batch.nftPolicyId}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* QR Code Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code</CardTitle>
                            <CardDescription>Scan to verify authenticity</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            {batch.qrCodeUrl ? (
                                <>
                                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                                        <img
                                            src={batch.qrCodeUrl}
                                            alt="QR Code"
                                            className="w-48 h-48"
                                        />
                                    </div>
                                    <div className="flex gap-2 w-full">
                                        <Button className="flex-1" variant="outline" asChild>
                                            <a href={batch.qrCodeUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View
                                            </a>
                                        </Button>
                                        <Button className="flex-1" variant="outline" asChild>
                                            <a href={batch.qrCodeUrl} download={`qr-${batch.lotId || batch.id}.png`}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">QR code will be generated after QC approval</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Blockchain Card */}
                    {batch.nftPolicyId && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-purple-600" />
                                    Blockchain
                                </CardTitle>
                                <CardDescription>On-chain verification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Policy ID</p>
                                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                                        {batch.nftPolicyId}
                                    </p>
                                </div>
                                {batch.blockchainTxHash && (
                                    <Button className="w-full" variant="secondary" asChild>
                                        <a
                                            href={`https://preprod.cardanoscan.io/transaction/${batch.blockchainTxHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Cardanoscan
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}