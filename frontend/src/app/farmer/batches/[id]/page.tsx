'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BatchDetail } from '@/components/batches/BatchDetail';
import { BatchHistory } from '@/components/batches/BatchHistory';
import { useQuery } from '@tanstack/react-query';
import * as batchService from '@/services/batch.service';
import { ProductType } from '@/types';
import Link from 'next/link';

export default function BatchDetailPage() {
    const params = useParams();
    const batchId = params.id as string;
    const [productType, setProductType] = useState<ProductType>(ProductType.coffee);

    // First, try to get the batch to determine its type
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
                        <Link href="/farmer/batches">
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
                        <Link href="/farmer/batches">
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/farmer/batches">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Batches
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Batch Details</h1>
                        <p className="text-muted-foreground">
                            View complete information about this batch
                        </p>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/farmer/batches/${batchId}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Link>
                </Button>
            </div>

            <BatchDetail batch={batch} productType={productType} />

            <BatchHistory batchId={batchId} initialHistory={batch.history} />
        </div>
    );
}

