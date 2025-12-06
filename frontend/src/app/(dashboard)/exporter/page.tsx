"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Loader2, Eye, Ship, PackageCheck } from "lucide-react";

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
import { useBatches } from "@/hooks/useBatches";
import { ProductType } from "@/types";
import { ShipmentModal } from "@/components/exporter/ShipmentModal";

export default function ExporterDashboard() {
    const { data: batchesData, isLoading } = useBatches(
        {}, // Fetch all relevant batches
        ProductType.coffee
    );

    const [selectedBatch, setSelectedBatch] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const batches = batchesData ?? [];

    // Filter for batches ready for export
    // Assuming 'ready_for_export' is a status set by washing station
    const readyBatches = batches.filter((b: any) =>
        b.status === 'ready_for_export' || (b.currentStage === 'washing_station' && b.status === 'approved')
    );

    const shippedBatches = batches.filter((b: any) =>
        b.currentStage === 'exporter' || b.status === 'in_transit'
    );

    const openShipmentModal = (batch: any) => {
        setSelectedBatch(batch);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Exporter Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage international shipments and logistics.
                </p>
            </div>

            {/* Ready for Export Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Ready for Export</CardTitle>
                    <CardDescription>
                        Batches processed and approved for shipment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : readyBatches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No batches ready for export.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Origin</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {readyBatches.map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>{batch.originLocation}</TableCell>
                                        <TableCell>{batch.grade || "N/A"}</TableCell>
                                        <TableCell>{batch.quantity} kg</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openShipmentModal(batch)}
                                                >
                                                    <Ship className="mr-2 h-4 w-4" />
                                                    Create Shipment
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

            {/* Shipped Batches Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Shipments</CardTitle>
                    <CardDescription>
                        Batches currently in transit or completed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : shippedBatches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No shipments found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Carrier</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {shippedBatches.map((batch: any) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">
                                            {batch.lotId || batch.id.substring(0, 8)}
                                        </TableCell>
                                        <TableCell>{batch.metadata?.shipment?.destination || "N/A"}</TableCell>
                                        <TableCell>{batch.metadata?.shipment?.carrier || "N/A"}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {batch.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/farmer/batches/${batch.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {selectedBatch && (
                <ShipmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    batchId={selectedBatch.id}
                    type={selectedBatch.type}
                />
            )}
        </div>
    );
}
