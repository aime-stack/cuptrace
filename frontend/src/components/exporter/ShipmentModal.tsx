"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateBatch } from "@/hooks/useBatches";
import { ProductType, SupplyChainStage, BatchStatus } from "@/types";

const shipmentSchema = z.object({
    destination: z.string().min(1, "Destination is required"),
    carrier: z.string().min(1, "Carrier is required"),
    trackingNumber: z.string().min(1, "Tracking number is required"),
    estimatedArrival: z.string().min(1, "Estimated arrival date is required"),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

interface ShipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    batchId: string;
    type: ProductType;
}

export function ShipmentModal({
    isOpen,
    onClose,
    batchId,
    type,
}: ShipmentModalProps) {
    const { mutate: updateBatch, isPending } = useUpdateBatch(type);

    const form = useForm<ShipmentFormData>({
        resolver: zodResolver(shipmentSchema),
        defaultValues: {
            destination: "",
            carrier: "",
            trackingNumber: "",
            estimatedArrival: "",
        },
    });

    const onSubmit = (data: ShipmentFormData) => {
        updateBatch(
            {
                id: batchId,
                data: {
                    currentStage: SupplyChainStage.exporter,
                    status: BatchStatus.exported,
                    metadata: {
                        shipment: {
                            ...data,
                            shippedAt: new Date().toISOString(),
                        },
                    },
                },
            },
            {
                onSuccess: () => {
                    onClose();
                    form.reset();
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Shipment</DialogTitle>
                    <DialogDescription>
                        Enter shipment details to mark this batch as in transit.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="destination"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Amsterdam, Netherlands" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="carrier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carrier</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Maersk" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="trackingNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tracking Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. TRK123456789" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="estimatedArrival"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estimated Arrival</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Shipment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
