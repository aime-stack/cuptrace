'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BatchForm } from '@/roles/farmer/components/BatchForm';
import { useQuery } from '@tanstack/react-query';
import * as batchService from '@/services/batch.service';
import { ProductType } from '@/types';
import Link from 'next/link';

export default function EditBatchPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = params.id as string;
    const [productType, setProductType] = useState<ProductType>(ProductType.coffee);

    // Fetch batch to determine type and populate form
    const { data: batch, isLoading, error } = useQuery({
        queryKey: ['batch', batchId, productType],
        queryFn: () => batchService.getBatch(batchId, productType),
        enabled: !!batchId,
        retry: (failureCount, error: any) => {
            // If coffee fails, try tea
            if (failureCount === 0 && productType === ProductType.coffee) {
                setProductType(ProductType.tea);
                return true;
            }
            return false;
        },
    });

    // Update product type when batch is loaded
    useEffect(() => {
        if (batch?.type) {
            setProductType(batch.type as ProductType);
        }
    }, [batch?.type]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/farmer/batches/${batchId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                </div>
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !batch) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/farmer/batches/${batchId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                </div>
                <div className="text-center py-12">
                    <p className="text-red-600">Batch not found or error loading batch</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/farmer/batches/${batchId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Batch
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Batch</h1>
                    <p className="text-muted-foreground">
                        Update batch information
                    </p>
                </div>
            </div>

            <div className="text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium">Note: Some fields may be restricted from editing based on batch status.</p>
            </div>

            {/* Note: BatchForm would need to be enhanced to support edit mode */}
            <div className="text-center py-12 text-muted-foreground">
                <p>Batch editing functionality is being implemented.</p>
                <p className="text-sm mt-2">For now, please contact an administrator to update batch information.</p>
            </div>
        </div>
    );
}

