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
    Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBatch } from "@/hooks/useBatches";
import { ProductType } from "@/types";
import { QRCodeSVG } from "qrcode.react";

export default function BatchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // We'll default to coffee for now, but ideally we should know the type or try both
    // In a real app, the ID might encode the type or we'd have a unified lookup
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
                    <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Details</CardTitle>
                            <CardDescription>Core information about this harvest</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                    <div>
                                        <Badge variant={
                                            batch.status === 'approved' ? 'default' : // default is usually black/primary
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
                            </div>

                            <Separator />

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Processing</span>
                                    <p className="capitalize">{batch.processingType || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Grade</span>
                                    <p>{batch.grade || "N/A"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">Moisture</span>
                                    <p>{batch.moisture ? `${batch.moisture}%` : "N/A"}</p>
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

                    {/* Timeline / History could go here */}
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
                                {/* Add more history items here if available in batch.history */}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>QR Code</CardTitle>
                            <CardDescription>Scan to verify authenticity</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center space-y-4">
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <QRCodeSVG
                                    value={`https://cuptrace.app/verify/${(batch as any).qrCode || batch.id}`}
                                    size={200}
                                    level="H"
                                    includeMargin
                                />
                            </div>
                            <Button className="w-full" variant="outline">
                                <QrCode className="mr-2 h-4 w-4" />
                                Download QR
                            </Button>
                        </CardContent>
                    </Card>

                    {batch.blockchainTxHash && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Blockchain</CardTitle>
                                <CardDescription>On-chain verification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                                    {batch.blockchainTxHash}
                                </div>
                                <Button className="w-full" variant="secondary" asChild>
                                    <a
                                        href={`https://preprod.cardanoscan.io/transaction/${batch.blockchainTxHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View on Cardanoscan
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}