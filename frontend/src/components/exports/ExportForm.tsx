'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportRecord, CreateExportRequest, UpdateExportRequest } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as exportService from '@/services/export.service';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useAuth';

const exportSchema = z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    buyerName: z.string().min(2, 'Buyer name must be at least 2 characters'),
    buyerAddress: z.string().optional(),
    buyerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
    shippingMethod: z.enum(['air', 'sea', 'road']),
    shippingDate: z.string().min(1, 'Shipping date is required'),
    expectedArrival: z.string().optional(),
    trackingNumber: z.string().optional(),
    certificates: z.array(z.string()).optional(),
    blockchainTxHash: z.string().optional(),
});

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportFormProps {
    batchId?: string;
    exportRecord?: ExportRecord;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const SHIPPING_METHODS: { value: 'air' | 'sea' | 'road'; label: string }[] = [
    { value: 'air', label: 'Air' },
    { value: 'sea', label: 'Sea' },
    { value: 'road', label: 'Road' },
];

export function ExportForm({ 
    batchId: initialBatchId, 
    exportRecord,
    onSuccess,
    onCancel 
}: ExportFormProps) {
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();
    const isEdit = !!exportRecord;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ExportFormData>({
        resolver: zodResolver(exportSchema),
        defaultValues: exportRecord ? {
            batchId: exportRecord.batchId,
            buyerName: exportRecord.buyerName,
            buyerAddress: exportRecord.buyerAddress || '',
            buyerEmail: exportRecord.buyerEmail || '',
            shippingMethod: exportRecord.shippingMethod as 'air' | 'sea' | 'road',
            shippingDate: exportRecord.shippingDate.split('T')[0],
            expectedArrival: exportRecord.expectedArrival?.split('T')[0] || '',
            trackingNumber: exportRecord.trackingNumber || '',
            certificates: exportRecord.certificates || [],
            blockchainTxHash: exportRecord.blockchainTxHash || '',
        } : {
            batchId: initialBatchId || '',
            buyerName: '',
            buyerAddress: '',
            buyerEmail: '',
            shippingMethod: 'air',
            shippingDate: new Date().toISOString().split('T')[0],
            expectedArrival: '',
            trackingNumber: '',
            certificates: [],
            blockchainTxHash: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: ExportFormData) => {
            if (!user?.id) throw new Error('User not authenticated');
            const submitData: CreateExportRequest = {
                ...data,
                exporterId: user.id,
                buyerAddress: data.buyerAddress === '' ? undefined : data.buyerAddress,
                buyerEmail: data.buyerEmail === '' ? undefined : data.buyerEmail,
                expectedArrival: data.expectedArrival === '' ? undefined : data.expectedArrival,
                trackingNumber: data.trackingNumber === '' ? undefined : data.trackingNumber,
                certificates: data.certificates && data.certificates.length > 0 ? data.certificates : undefined,
                blockchainTxHash: data.blockchainTxHash === '' ? undefined : data.blockchainTxHash,
            };
            return exportService.createExport(submitData);
        },
        onSuccess: () => {
            toast.success('Export record created successfully');
            queryClient.invalidateQueries({ queryKey: ['exports'] });
            reset();
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create export record');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: ExportFormData) => {
            if (!exportRecord) throw new Error('Export record ID is required for update');
            const submitData: UpdateExportRequest = {
                buyerName: data.buyerName,
                buyerAddress: data.buyerAddress === '' ? undefined : data.buyerAddress,
                buyerEmail: data.buyerEmail === '' ? undefined : data.buyerEmail,
                shippingMethod: data.shippingMethod,
                shippingDate: data.shippingDate,
                expectedArrival: data.expectedArrival === '' ? undefined : data.expectedArrival,
                trackingNumber: data.trackingNumber === '' ? undefined : data.trackingNumber,
                certificates: data.certificates && data.certificates.length > 0 ? data.certificates : undefined,
                blockchainTxHash: data.blockchainTxHash === '' ? undefined : data.blockchainTxHash,
            };
            return exportService.updateExport(exportRecord.id, submitData);
        },
        onSuccess: () => {
            toast.success('Export record updated successfully');
            queryClient.invalidateQueries({ queryKey: ['exports'] });
            queryClient.invalidateQueries({ queryKey: ['export', exportRecord?.id] });
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update export record');
        },
    });

    const onSubmit = (data: ExportFormData) => {
        if (isEdit) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEdit ? 'Edit Export Record' : 'Create Export Record'}</CardTitle>
                <CardDescription>
                    {isEdit ? 'Update export record information' : 'Record a new export for a batch'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="batchId">Batch ID *</Label>
                        <Input
                            id="batchId"
                            placeholder="Enter batch ID"
                            {...register('batchId')}
                            disabled={isPending || isEdit}
                        />
                        {errors.batchId && (
                            <p className="text-sm text-red-500">{errors.batchId.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="buyerName">Buyer Name *</Label>
                        <Input
                            id="buyerName"
                            placeholder="Enter buyer name"
                            {...register('buyerName')}
                            disabled={isPending}
                        />
                        {errors.buyerName && (
                            <p className="text-sm text-red-500">{errors.buyerName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="buyerAddress">Buyer Address</Label>
                        <Textarea
                            id="buyerAddress"
                            placeholder="Enter buyer address"
                            {...register('buyerAddress')}
                            disabled={isPending}
                            rows={3}
                        />
                        {errors.buyerAddress && (
                            <p className="text-sm text-red-500">{errors.buyerAddress.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="buyerEmail">Buyer Email</Label>
                        <Input
                            id="buyerEmail"
                            type="email"
                            placeholder="buyer@example.com"
                            {...register('buyerEmail')}
                            disabled={isPending}
                        />
                        {errors.buyerEmail && (
                            <p className="text-sm text-red-500">{errors.buyerEmail.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="shippingMethod">Shipping Method *</Label>
                            <select
                                id="shippingMethod"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                {...register('shippingMethod')}
                                disabled={isPending}
                            >
                                {SHIPPING_METHODS.map((method) => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                            {errors.shippingMethod && (
                                <p className="text-sm text-red-500">{errors.shippingMethod.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shippingDate">Shipping Date *</Label>
                            <Input
                                id="shippingDate"
                                type="date"
                                {...register('shippingDate')}
                                disabled={isPending}
                            />
                            {errors.shippingDate && (
                                <p className="text-sm text-red-500">{errors.shippingDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expectedArrival">Expected Arrival Date</Label>
                        <Input
                            id="expectedArrival"
                            type="date"
                            {...register('expectedArrival')}
                            disabled={isPending}
                        />
                        {errors.expectedArrival && (
                            <p className="text-sm text-red-500">{errors.expectedArrival.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input
                            id="trackingNumber"
                            placeholder="Enter tracking number"
                            {...register('trackingNumber')}
                            disabled={isPending}
                        />
                        {errors.trackingNumber && (
                            <p className="text-sm text-red-500">{errors.trackingNumber.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="blockchainTxHash">Blockchain Transaction Hash</Label>
                        <Input
                            id="blockchainTxHash"
                            placeholder="Enter blockchain transaction hash"
                            {...register('blockchainTxHash')}
                            disabled={isPending}
                        />
                        {errors.blockchainTxHash && (
                            <p className="text-sm text-red-500">{errors.blockchainTxHash.message}</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isPending}
                        >
                            {isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isEdit ? 'Update Export' : 'Create Export'}
                        </Button>
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

