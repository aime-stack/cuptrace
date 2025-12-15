"use client";

import { useState, Suspense } from "react";
import { Search, Loader2, Package, MapPin, Calendar, CheckCircle, Truck, Factory, Sprout, FileJson, ExternalLink, Coffee as CoffeeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVerifyBatch } from "@/hooks/useBatches";
import { ProductType, SupplyChainStage } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

import { useSearchParams } from "next/navigation";

const STAGES = [
    { id: SupplyChainStage.farmer, label: "Farmer", icon: Sprout },
    { id: SupplyChainStage.washing_station, label: "Processing", icon: Factory },
    { id: SupplyChainStage.factory, label: "Factory", icon: FileJson }, // Factory typically mints NFT
    { id: SupplyChainStage.exporter, label: "Export", icon: Truck },
    { id: SupplyChainStage.retailer, label: "Retail", icon: CoffeeIcon },
];

function VerifyContent() {
    const searchParams = useSearchParams();
    const initialCode = searchParams.get("code") || "";

    const [qrCode, setQrCode] = useState(initialCode);
    const [hasSearched, setHasSearched] = useState(!!initialCode);

    // Call without type to trigger smart search across all databases
    const { data: batch, isLoading, error, refetch } = useVerifyBatch(qrCode);

    const handleSearch = () => {
        if (qrCode.trim()) {
            setHasSearched(true);
            refetch();
        }
    };

    const getActiveStageIndex = (currentStage: SupplyChainStage) => {
        const index = STAGES.findIndex(s => s.id === currentStage);
        return index !== -1 ? index : 0;
    };

    const activeStageIndex = batch ? getActiveStageIndex(batch.currentStage) : -1;

    return (
        <div className="container mx-auto px-4 -mt-8 relative z-20 max-w-4xl">
            {/* Search Card */}
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <CardHeader>
                    <CardTitle className="text-coffee-950">Track Your Product</CardTitle>
                    <CardDescription className="text-slate-600 font-medium">
                        Enter the Batch Code (e.g., LOT-2025...) or scan the QR code to trace its journey.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">


                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="e.g. LOT-2025-ABCD-1234"
                                value={qrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10 h-12 text-lg"
                            />
                        </div>
                        <Button size="lg" onClick={handleSearch} disabled={isLoading || !qrCode.trim()} className="h-12 px-8 bg-coffee-600 hover:bg-coffee-700 text-white">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Trace Now"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            <div className="mt-12 space-y-8">
                {hasSearched && error && !isLoading && (
                    <Card className="border-red-200 bg-red-50 text-center py-12">
                        <CardContent>
                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-red-900 mb-2">No Record Found</h3>
                            <p className="text-red-700 max-w-md mx-auto">
                                We couldn&apos;t find a batch with that ID. Please double-check the code and try again.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {batch && !isLoading && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        {/* Status Header */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge variant={batch.status === 'approved' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                                        {(batch.status || 'UNKNOWN').toUpperCase()}
                                    </Badge>
                                    <span className="text-muted-foreground font-mono text-sm">#{batch.lotId || (batch.id ? batch.id.substring(0, 8) : 'N/A')}</span>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {batch.quantity}kg {batch.processingType} {batch.type === ProductType.coffee ? 'Coffee' : 'Tea'}
                                </h2>
                            </div>
                            {batch.blockchainTxHash && (
                                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">Blockchain Verified</span>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <Card className="overflow-hidden border-none shadow-lg">
                            <div className="bg-gradient-to-r from-coffee-600 to-coffee-800 p-6 text-white">
                                <h3 className="text-xl font-semibold mb-6">Supply Chain Journey</h3>

                                <div className="relative">
                                    {/* Progress Bar Background */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-white/20 -translate-y-1/2 hidden md:block"></div>

                                    {/* Progress Bar Active */}
                                    <div
                                        className="absolute top-1/2 left-0 h-1 bg-green-400 -translate-y-1/2 hidden md:block transition-all duration-1000"
                                        style={{ width: `${(activeStageIndex / (STAGES.length - 1)) * 100}%` }}
                                    ></div>

                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6">
                                        {STAGES.map((stage, index) => {
                                            const isActive = index <= activeStageIndex;
                                            const isCurrent = index === activeStageIndex;
                                            const Icon = stage.icon;

                                            return (
                                                <div key={stage.id} className={`flex md:flex-col items-center gap-4 md:gap-2 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                                                    <div className={`
                                                        h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all duration-300
                                                        ${isCurrent ? 'bg-white text-coffee-700 scale-110 shadow-lg ring-4 ring-white/20' : isActive ? 'bg-green-400 text-white' : 'bg-white/10 text-white'}
                                                    `}>
                                                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                                                    </div>
                                                    <div className="md:text-center">
                                                        <p className={`font-semibold text-sm md:text-base ${isCurrent ? 'text-white' : 'text-coffee-100'}`}>{stage.label}</p>
                                                        {isCurrent && <p className="text-xs text-green-300 font-medium">Current Stage</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Details Card */}
                            <Card className="md:col-span-2 shadow-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-coffee-600" />
                                        Batch Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
                                    <div>
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <MapPin className="h-4 w-4" />
                                            <span className="text-sm">Origin</span>
                                        </div>
                                        <p className="font-medium text-lg">{batch.originLocation}</p>
                                        <p className="text-sm text-gray-500">{batch.district || batch.region}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-sm">Harvest Date</span>
                                        </div>
                                        <p className="font-medium text-lg">{formatDate(batch.harvestDate)}</p>
                                    </div>

                                    <div className="border-t pt-4">
                                        <span className="text-sm text-muted-foreground block mb-1">Quantity/Quality</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-bold">{batch.quantity}kg</span>
                                            <span className="text-sm text-gray-500">• {batch.quality} Grade</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <span className="text-sm text-muted-foreground block mb-1">Description</span>
                                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                            {batch.description || "No description provided."}
                                        </p>
                                    </div>
                                </CardContent>
                                {batch.qrCodeUrl && (
                                    <CardFooter className="bg-gray-50 border-t flex items-center gap-4">
                                        <div className="h-16 w-16 relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={batch.qrCodeUrl} alt="Batch QR" className="h-full w-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">Product QR Code</p>
                                            <p className="text-xs text-muted-foreground">Scan to verify this exact batch</p>
                                        </div>
                                    </CardFooter>
                                )}
                            </Card>

                            {/* Digital Passport (NFT) */}
                            <Card className="shadow-md bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-indigo-900">
                                        <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
                                        Digital Passport
                                    </CardTitle>
                                    <CardDescription className="text-indigo-600/80">
                                        Immutable Blockchain Record
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {batch.nftPolicyId ? (
                                        <>
                                            <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">Asset Name</p>
                                                <p className="font-mono text-sm break-all text-indigo-900">{batch.nftAssetName || 'N/A'}</p>
                                            </div>
                                            <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-1">Policy ID</p>
                                                <p className="font-mono text-xs break-all text-gray-600">{batch.nftPolicyId}</p>
                                            </div>
                                            <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700" asChild>
                                                <Link href={`https://cardanoscan.io/token/${batch.nftPolicyId}${batch.nftAssetName}`} target="_blank">
                                                    View on Cardanoscan
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <p className="text-xs text-center text-indigo-400 mt-2">
                                                Minted: {formatDate(batch.nftMintedAt)}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <div className="inline-block p-3 rounded-full bg-gray-100 mb-3">
                                                <Package className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm font-medium">Minting in progress</p>
                                            <p className="text-xs mt-1">
                                                NFT Passport will be created at the Factory stage.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 pb-20">
            {/* Hero Header */}
            <div className="bg-coffee-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-coffee-900 to-coffee-800"></div>
                <div className="container mx-auto px-4 py-16 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Trace Your Product</h1>
                    <p className="text-coffee-100 text-lg max-w-2xl mx-auto">
                        Verify authenticity and explore the journey from farm to cup with our blockchain-powered tracker.
                    </p>
                </div>
            </div>

            <Suspense fallback={
                <div className="container mx-auto px-4 py-12 flex justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-coffee-600" />
                </div>
            }>
                <VerifyContent />
            </Suspense>
        </div>
    );
}

function ShieldCheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
