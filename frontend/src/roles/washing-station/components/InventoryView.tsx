'use client';

import { ClipboardList, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBatches } from '@/hooks/useBatches';
import { useCurrentUser } from '@/hooks/useAuth';
import { ProductType } from '@/types';

export function InventoryView() {
    const { data: user } = useCurrentUser();
    const { data: batches, isLoading } = useBatches({ washingStationId: user?.id }, ProductType.coffee);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Current Inventory
                </CardTitle>
                <CardDescription>
                    Batches in your inventory
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : !batches || batches.length === 0 ? (
                    <div className="text-center py-12">
                        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory found</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {batches.map((batch: any) => (
                            <div key={batch.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{batch.lotId || batch.id.substring(0, 8)}</p>
                                        <p className="text-sm text-gray-500 capitalize">{batch.type}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{batch.quantity || 0} kg</p>
                                        <p className="text-sm text-gray-500">{batch.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

