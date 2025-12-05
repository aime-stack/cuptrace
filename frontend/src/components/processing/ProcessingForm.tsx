'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProcessingRecord, CreateProcessingRecordRequest, UpdateProcessingRecordRequest, SupplyChainStage } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as processingService from '@/services/processing.service';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useAuth';

const processingSchema = z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    stage: z.nativeEnum(SupplyChainStage),
    processingType: z.string().min(1, 'Processing type is required'),
    notes: z.string().optional(),
    qualityScore: z.number().min(0).max(100).optional().or(z.literal('')),
    quantityIn: z.number().min(0).optional().or(z.literal('')),
    quantityOut: z.number().min(0).optional().or(z.literal('')),
    processedAt: z.string().optional(),
    blockchainTxHash: z.string().optional(),
});

type ProcessingFormData = z.infer<typeof processingSchema>;

interface ProcessingFormProps {
    batchId?: string;
    stage?: SupplyChainStage;
    processingRecord?: ProcessingRecord;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const STAGE_OPTIONS: { value: SupplyChainStage; label: string }[] = [
    { value: SupplyChainStage.farmer, label: 'Farmer' },
    { value: SupplyChainStage.washing_station, label: 'Washing Station' },
    { value: SupplyChainStage.factory, label: 'Factory' },
    { value: SupplyChainStage.exporter, label: 'Exporter' },
    { value: SupplyChainStage.importer, label: 'Importer' },
    { value: SupplyChainStage.retailer, label: 'Retailer' },
];

export function ProcessingForm({ 
    batchId: initialBatchId, 
    stage: initialStage,
    processingRecord,
    onSuccess,
    onCancel 
}: ProcessingFormProps) {
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();
    const isEdit = !!processingRecord;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ProcessingFormData>({
        resolver: zodResolver(processingSchema),
        defaultValues: processingRecord ? {
            batchId: processingRecord.batchId,
            stage: processingRecord.stage,
            processingType: processingRecord.processingType,
            notes: processingRecord.notes || '',
            qualityScore: processingRecord.qualityScore || '',
            quantityIn: processingRecord.quantityIn || '',
            quantityOut: processingRecord.quantityOut || '',
            processedAt: processingRecord.processedAt?.split('T')[0] || '',
            blockchainTxHash: processingRecord.blockchainTxHash || '',
        } : {
            batchId: initialBatchId || '',
            stage: initialStage || SupplyChainStage.washing_station,
            processingType: '',
            notes: '',
            qualityScore: '',
            quantityIn: '',
            quantityOut: '',
            processedAt: new Date().toISOString().split('T')[0],
            blockchainTxHash: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: ProcessingFormData) => {
            if (!user?.id) throw new Error('User not authenticated');
            const submitData: CreateProcessingRecordRequest = {
                ...data,
                processedBy: user.id,
                notes: data.notes === '' ? undefined : data.notes,
                qualityScore: data.qualityScore === '' ? undefined : Number(data.qualityScore),
                quantityIn: data.quantityIn === '' ? undefined : Number(data.quantityIn),
                quantityOut: data.quantityOut === '' ? undefined : Number(data.quantityOut),
                processedAt: data.processedAt === '' ? undefined : data.processedAt,
                blockchainTxHash: data.blockchainTxHash === '' ? undefined : data.blockchainTxHash,
            };
            return processingService.createProcessingRecord(submitData);
        },
        onSuccess: () => {
            toast.success('Processing record created successfully');
            queryClient.invalidateQueries({ queryKey: ['processing-records'] });
            queryClient.invalidateQueries({ queryKey: ['processing'] });
            reset();
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create processing record');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: ProcessingFormData) => {
            if (!processingRecord) throw new Error('Processing record ID is required for update');
            const submitData: UpdateProcessingRecordRequest = {
                processingType: data.processingType,
                notes: data.notes === '' ? undefined : data.notes,
                qualityScore: data.qualityScore === '' ? undefined : Number(data.qualityScore),
                quantityIn: data.quantityIn === '' ? undefined : Number(data.quantityIn),
                quantityOut: data.quantityOut === '' ? undefined : Number(data.quantityOut),
                blockchainTxHash: data.blockchainTxHash === '' ? undefined : data.blockchainTxHash,
            };
            return processingService.updateProcessingRecord(processingRecord.id, submitData);
        },
        onSuccess: () => {
            toast.success('Processing record updated successfully');
            queryClient.invalidateQueries({ queryKey: ['processing-records'] });
            queryClient.invalidateQueries({ queryKey: ['processing', processingRecord?.id] });
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update processing record');
        },
    });

    const onSubmit = (data: ProcessingFormData) => {
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
                <CardTitle>{isEdit ? 'Edit Processing Record' : 'Create Processing Record'}</CardTitle>
                <CardDescription>
                    {isEdit ? 'Update processing record information' : 'Record processing activity for a batch'}
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
                        <Label htmlFor="stage">Stage *</Label>
                        <select
                            id="stage"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...register('stage')}
                            disabled={isPending || isEdit}
                        >
                            {STAGE_OPTIONS.map((stage) => (
                                <option key={stage.value} value={stage.value}>
                                    {stage.label}
                                </option>
                            ))}
                        </select>
                        {errors.stage && (
                            <p className="text-sm text-red-500">{errors.stage.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="processingType">Processing Type *</Label>
                        <Input
                            id="processingType"
                            placeholder="e.g., Wet processing, Dry processing"
                            {...register('processingType')}
                            disabled={isPending}
                        />
                        {errors.processingType && (
                            <p className="text-sm text-red-500">{errors.processingType.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantityIn">Quantity In (kg)</Label>
                            <Input
                                id="quantityIn"
                                type="number"
                                step="0.01"
                                placeholder="Enter quantity in"
                                {...register('quantityIn', { valueAsNumber: true })}
                                disabled={isPending}
                            />
                            {errors.quantityIn && (
                                <p className="text-sm text-red-500">{errors.quantityIn.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantityOut">Quantity Out (kg)</Label>
                            <Input
                                id="quantityOut"
                                type="number"
                                step="0.01"
                                placeholder="Enter quantity out"
                                {...register('quantityOut', { valueAsNumber: true })}
                                disabled={isPending}
                            />
                            {errors.quantityOut && (
                                <p className="text-sm text-red-500">{errors.quantityOut.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="qualityScore">Quality Score (0-100)</Label>
                        <Input
                            id="qualityScore"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Enter quality score"
                            {...register('qualityScore', { valueAsNumber: true })}
                            disabled={isPending}
                        />
                        {errors.qualityScore && (
                            <p className="text-sm text-red-500">{errors.qualityScore.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="processedAt">Processed At</Label>
                        <Input
                            id="processedAt"
                            type="date"
                            {...register('processedAt')}
                            disabled={isPending}
                        />
                        {errors.processedAt && (
                            <p className="text-sm text-red-500">{errors.processedAt.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any notes about the processing"
                            {...register('notes')}
                            disabled={isPending}
                            rows={4}
                        />
                        {errors.notes && (
                            <p className="text-sm text-red-500">{errors.notes.message}</p>
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
                            {isEdit ? 'Update Processing Record' : 'Create Processing Record'}
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

