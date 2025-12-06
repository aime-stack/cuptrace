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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBatch } from "@/hooks/useBatches";
import { ProductType, BatchStatus } from "@/types";

const processBatchSchema = z.object({
    status: z.string().min(1, "Status is required"),
    notes: z.string().optional(),
});

type ProcessBatchFormData = z.infer<typeof processBatchSchema>;

interface ProcessBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    batchId: string;
    currentStatus: string;
    type: ProductType;
}

const WASHING_STATION_STATUSES = [
    { value: "washing", label: "Washing" },
    { value: "drying", label: "Drying" },
    { value: "milling", label: "Milling" },
    { value: "grading", label: "Grading" },
    { value: "ready_for_export", label: "Ready for Export" },
];

export function ProcessBatchModal({
    isOpen,
    onClose,
    batchId,
    currentStatus,
    type,
}: ProcessBatchModalProps) {
    const { mutate: updateBatch, isPending } = useUpdateBatch(type);

    const form = useForm<ProcessBatchFormData>({
        resolver: zodResolver(processBatchSchema),
        defaultValues: {
            status: currentStatus,
            notes: "",
        },
    });

    const onSubmit = (data: ProcessBatchFormData) => {
        updateBatch(
            {
                id: batchId,
                data: {
                    status: data.status as BatchStatus,
                    metadata: {
                        notes: data.notes,
                        processedAt: new Date().toISOString(),
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
                    <DialogTitle>Update Batch Status</DialogTitle>
                    <DialogDescription>
                        Update the processing stage for this batch.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Status</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {WASHING_STATION_STATUSES.map((status) => (
                                                <SelectItem key={status.value} value={status.value}>
                                                    {status.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any processing notes..."
                                            {...field}
                                        />
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
                                Update Status
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
