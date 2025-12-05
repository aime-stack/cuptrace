'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CertificateType, Certificate } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as certificateService from '@/services/certificate.service';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useAuth';

const certificateSchema = z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    certificateType: z.enum(['organic', 'fair_trade', 'quality_grade', 'export_permit', 'health_certificate', 'origin_certificate', 'other']),
    certificateNumber: z.string().min(1, 'Certificate number is required'),
    issuedBy: z.string().min(1, 'Issued by is required'),
    issuedDate: z.string().min(1, 'Issued date is required'),
    expiryDate: z.string().optional(),
    documentUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    blockchainTxHash: z.string().optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface CertificateFormProps {
    batchId?: string;
    certificate?: Certificate;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CERTIFICATE_TYPES: { value: CertificateType; label: string }[] = [
    { value: 'organic', label: 'Organic' },
    { value: 'fair_trade', label: 'Fair Trade' },
    { value: 'quality_grade', label: 'Quality Grade' },
    { value: 'export_permit', label: 'Export Permit' },
    { value: 'health_certificate', label: 'Health Certificate' },
    { value: 'origin_certificate', label: 'Origin Certificate' },
    { value: 'other', label: 'Other' },
];

export function CertificateForm({ 
    batchId: initialBatchId, 
    certificate,
    onSuccess,
    onCancel 
}: CertificateFormProps) {
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();
    const isEdit = !!certificate;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CertificateFormData>({
        resolver: zodResolver(certificateSchema),
        defaultValues: certificate ? {
            batchId: certificate.batchId,
            certificateType: certificate.certificateType,
            certificateNumber: certificate.certificateNumber,
            issuedBy: certificate.issuedBy,
            issuedDate: certificate.issuedDate.split('T')[0],
            expiryDate: certificate.expiryDate?.split('T')[0] || '',
            documentUrl: certificate.documentUrl || '',
            blockchainTxHash: certificate.blockchainTxHash || '',
        } : {
            batchId: initialBatchId || '',
            certificateType: 'organic',
            certificateNumber: '',
            issuedBy: '',
            issuedDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            documentUrl: '',
            blockchainTxHash: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: CertificateFormData) => {
            const submitData = {
                ...data,
                documentUrl: data.documentUrl === '' ? undefined : data.documentUrl,
                expiryDate: data.expiryDate === '' ? undefined : data.expiryDate,
                blockchainTxHash: data.blockchainTxHash === '' ? undefined : data.blockchainTxHash,
            };
            return certificateService.createCertificate(submitData);
        },
        onSuccess: () => {
            toast.success('Certificate created successfully');
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
            reset();
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create certificate');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: CertificateFormData) => {
            if (!certificate) throw new Error('Certificate ID is required for update');
            const submitData = {
                certificateType: data.certificateType,
                certificateNumber: data.certificateNumber,
                issuedBy: data.issuedBy,
                issuedDate: data.issuedDate,
                expiryDate: data.expiryDate === '' ? undefined : data.expiryDate,
                documentUrl: data.documentUrl === '' ? undefined : data.documentUrl,
                blockchainTxHash: data.blockchainTxHash === '' ? undefined : data.blockchainTxHash,
            };
            return certificateService.updateCertificate(certificate.id, submitData);
        },
        onSuccess: () => {
            toast.success('Certificate updated successfully');
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
            queryClient.invalidateQueries({ queryKey: ['certificate', certificate?.id] });
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update certificate');
        },
    });

    const onSubmit = (data: CertificateFormData) => {
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
                <CardTitle>{isEdit ? 'Edit Certificate' : 'Create Certificate'}</CardTitle>
                <CardDescription>
                    {isEdit ? 'Update certificate information' : 'Add a new certificate for a batch'}
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
                        <Label htmlFor="certificateType">Certificate Type *</Label>
                        <select
                            id="certificateType"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...register('certificateType')}
                            disabled={isPending}
                        >
                            {CERTIFICATE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                        {errors.certificateType && (
                            <p className="text-sm text-red-500">{errors.certificateType.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="certificateNumber">Certificate Number *</Label>
                        <Input
                            id="certificateNumber"
                            placeholder="Enter certificate number"
                            {...register('certificateNumber')}
                            disabled={isPending}
                        />
                        {errors.certificateNumber && (
                            <p className="text-sm text-red-500">{errors.certificateNumber.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="issuedBy">Issued By *</Label>
                        <Input
                            id="issuedBy"
                            placeholder="Enter issuer name"
                            {...register('issuedBy')}
                            disabled={isPending}
                        />
                        {errors.issuedBy && (
                            <p className="text-sm text-red-500">{errors.issuedBy.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="issuedDate">Issued Date *</Label>
                            <Input
                                id="issuedDate"
                                type="date"
                                {...register('issuedDate')}
                                disabled={isPending}
                            />
                            {errors.issuedDate && (
                                <p className="text-sm text-red-500">{errors.issuedDate.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                {...register('expiryDate')}
                                disabled={isPending}
                            />
                            {errors.expiryDate && (
                                <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="documentUrl">Document URL</Label>
                        <Input
                            id="documentUrl"
                            type="url"
                            placeholder="https://example.com/certificate.pdf"
                            {...register('documentUrl')}
                            disabled={isPending}
                        />
                        {errors.documentUrl && (
                            <p className="text-sm text-red-500">{errors.documentUrl.message}</p>
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
                            {isEdit ? 'Update Certificate' : 'Create Certificate'}
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

