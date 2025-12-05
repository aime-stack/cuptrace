'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SupplyChainStage, ProductType } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as stageService from '@/services/stage.service';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useAuth';

const stageUpdateSchema = z.object({
    stage: z.nativeEnum(SupplyChainStage),
    notes: z.string().max(1000, 'Notes must not exceed 1000 characters').optional(),
    quantity: z.number().positive('Quantity must be positive').optional().or(z.literal('')),
    quality: z.string().max(100, 'Quality must not exceed 100 characters').optional(),
    location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
    blockchainTxHash: z.string().optional(),
});

type StageUpdateFormData = z.infer<typeof stageUpdateSchema>;

interface StageUpdateFormProps {
    batchId: string;
    productType: ProductType;
    currentStage: SupplyChainStage;
    onSuccess?: () => void;
}

const STAGE_OPTIONS: { value: SupplyChainStage; label: string }[] = [
    { value: SupplyChainStage.farmer, label: 'Farmer' },
    { value: SupplyChainStage.washing_station, label: 'Washing Station' },
    { value: SupplyChainStage.factory, label: 'Factory' },
    { value: SupplyChainStage.exporter, label: 'Exporter' },
    { value: SupplyChainStage.importer, label: 'Importer' },
    { value: SupplyChainStage.retailer, label: 'Retailer' },
];

export function StageUpdateForm({ 
    batchId, 
    productType, 
    currentStage,
    onSuccess 
}: StageUpdateFormProps) {
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();
    const [nextStageIndex] = useState(() => {
        const currentIndex = STAGE_OPTIONS.findIndex(s => s.value === currentStage);
        return currentIndex < STAGE_OPTIONS.length - 1 ? currentIndex + 1 : currentIndex;
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<StageUpdateFormData>({
        resolver: zodResolver(stageUpdateSchema),
        defaultValues: {
            stage: STAGE_OPTIONS[nextStageIndex]?.value || currentStage,
            notes: '',
            quantity: undefined,
            quality: '',
            location: '',
            blockchainTxHash: '',
        },
    });

    const updateStageMutation = useMutation({
        mutationFn: async (data: StageUpdateFormData) => {
            const updateData = {
                ...data,
                changedBy: user?.id || '',
                quantity: data.quantity === '' ? undefined : data.quantity,
            };

            if (productType === ProductType.coffee) {
                return stageService.updateCoffeeStage(batchId, updateData);
            } else {
                return stageService.updateTeaStage(batchId, updateData);
            }
        },
        onSuccess: () => {
            toast.success('Batch stage updated successfully');
            queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
            queryClient.invalidateQueries({ queryKey: ['batchHistory', batchId] });
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            reset();
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update batch stage');
        },
    });

    const onSubmit = (data: StageUpdateFormData) => {
        updateStageMutation.mutate(data);
    };

    const availableStages = STAGE_OPTIONS.filter(
        (stage, index) => index >= STAGE_OPTIONS.findIndex(s => s.value === currentStage)
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Update Batch Stage</CardTitle>
                <CardDescription>
                    Move this batch to the next stage in the supply chain
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stage">New Stage *</Label>
                        <select
                            id="stage"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...register('stage')}
                            disabled={updateStageMutation.isPending}
                        >
                            {availableStages.map((stage) => (
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
                        <Label htmlFor="quantity">Quantity (kg)</Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            placeholder="Enter quantity"
                            {...register('quantity', { valueAsNumber: true })}
                            disabled={updateStageMutation.isPending}
                        />
                        {errors.quantity && (
                            <p className="text-sm text-red-500">{errors.quantity.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quality">Quality</Label>
                        <Input
                            id="quality"
                            placeholder="Enter quality rating"
                            {...register('quality')}
                            disabled={updateStageMutation.isPending}
                        />
                        {errors.quality && (
                            <p className="text-sm text-red-500">{errors.quality.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                            id="location"
                            placeholder="Enter location"
                            {...register('location')}
                            disabled={updateStageMutation.isPending}
                        />
                        {errors.location && (
                            <p className="text-sm text-red-500">{errors.location.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any notes about this stage transition"
                            {...register('notes')}
                            disabled={updateStageMutation.isPending}
                            rows={4}
                        />
                        {errors.notes && (
                            <p className="text-sm text-red-500">{errors.notes.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="blockchainTxHash">Blockchain Transaction Hash (Optional)</Label>
                        <Input
                            id="blockchainTxHash"
                            placeholder="Enter blockchain transaction hash"
                            {...register('blockchainTxHash')}
                            disabled={updateStageMutation.isPending}
                        />
                        {errors.blockchainTxHash && (
                            <p className="text-sm text-red-500">{errors.blockchainTxHash.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={updateStageMutation.isPending}
                    >
                        {updateStageMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Update Stage
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

