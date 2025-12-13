'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronLeft, Edit, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BatchDetail } from '@/components/batches/BatchDetail';
import { BatchHistory } from '@/components/batches/BatchHistory';
import { useQuery } from '@tanstack/react-query';
import { BatchTimeline } from '@/components/batches/BatchTimeline';
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
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
                        <Link href="/farmer/batches">
                            <ChevronLeft className="h-4 w-4" />
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
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
                        <Link href="/farmer/batches">
                            <ChevronLeft className="h-4 w-4" />
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
                        <Link href="/farmer/batches">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Batch Details</h1>
                        <p className="text-sm text-muted-foreground">
                            View complete information about this batch
                        </p>
                    </div>
                </div>
                <Button variant="outline" className="w-full md:w-auto" asChild>
                    <Link href={`/farmer/batches/${batchId}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Link>
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-6">Traceability Journey</h3>
                <BatchTimeline currentStage={batch.currentStage} history={batch.history} />
            </div>

            <BatchDetail batch={batch} productType={productType} />

            <BatchHistory batchId={batchId} initialHistory={batch.history} />
        </div>
    );
}
