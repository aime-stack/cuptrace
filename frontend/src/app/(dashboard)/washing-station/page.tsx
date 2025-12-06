"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Eye, CheckCircle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBatches, useUpdateBatch } from "@/hooks/useBatches";
import { ProductType, SupplyChainStage, BatchStatus } from "@/types";
import { ProcessBatchModal } from "@/components/washing-station/ProcessBatchModal";

export default function WashingStationDashboard() {
    // In a real app, we'd filter by the washing station's ID or location
    // For now, we fetch all batches and filter client-side or assume the API handles it based on auth
    const { data: batchesData, isLoading } = useBatches(
        {}, // Fetch all relevant batches
        ProductType.coffee
    );
    const { mutate: updateBatch, isPending: isUpdating } = useUpdateBatch(ProductType.coffee);

    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const batches = batchesData ?? [];

    // Filter for batches that are relevant to washing station
    // 1. New batches from farmers (status: pending/approved, stage: farmer)
    // 2. Batches currently in processing (stage: washing_station)
    const incomingBatches = batches.filter((b: any) =>
        b.currentStage === 'farmer' && b.status !== 'rejected'
    );

    const processingBatches = batches.filter((b: any) =>
        b.currentStage === 'washing_station'
    );

    const handleReceiveBatch = (batchId: string) => {
        updateBatch({
            id: batchId,
            data: {
                currentStage: SupplyChainStage.washing_station,
                status: BatchStatus.processing,
                metadata: {
                    receivedAt: new Date().toISOString(),
                }
            }
        });
    };

    const openProcessModal = (batch: any) => {
        setSelectedBatch(batch);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Washing Station Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage incoming harvests and processing.
                </p>
            </div>

            {/* Incoming Batches Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Incoming Batches</CardTitle>
                    <CardDescription>
                        New batches from farmers waiting to be received.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : incomingBatches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No incoming batches found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Farmer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Origin</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incomingBatches.map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>{batch.farmer?.name || "Unknown"}</TableCell>
                                        <TableCell>
                                            {format(new Date(batch.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{batch.quantity} kg</TableCell>
                                        <TableCell>{batch.originLocation}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleReceiveBatch(batch.id)}
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                                    Receive
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/farmer/batches/${batch.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Processing Batches Section */}
            <Card>
                <CardHeader>
                    <CardTitle>In Processing</CardTitle>
                    <CardDescription>
                        Batches currently being processed at the station.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : processingBatches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No batches currently in processing.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Processing Type</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processingBatches.map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {batch.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="capitalize">{batch.processingType || "N/A"}</TableCell>
                                        <TableCell>
                                            {format(new Date(batch.updatedAt), "MMM d, HH:mm")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openProcessModal(batch)}
                                                >
                                                    Update Status
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/farmer/batches/${batch.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {selectedBatch && (
                <ProcessBatchModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    batchId={selectedBatch.id}
                    currentStatus={selectedBatch.status}
                    type={selectedBatch.type}
                />
            )}
        </div>
    );
}
