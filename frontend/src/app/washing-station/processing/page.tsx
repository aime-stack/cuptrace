'use client';

import { Settings, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as processingService from '@/services/processing.service';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useAuth';

export default function ProcessingPage() {
    const { data: user } = useCurrentUser();
    const { data: records, isLoading } = useQuery({
        queryKey: ['processing-records', user?.id],
        queryFn: () => processingService.listProcessingRecords(1, 10, undefined, 'washing_station'),
        enabled: !!user?.id,
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Processing</h1>
                <p className="text-muted-foreground">
                    Manage batch processing activities
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Processing Records</CardTitle>
                    <CardDescription>
                        Track all processing activities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !records || records.length === 0 ? (
                        <div className="text-center py-12">
                            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No processing records found</h3>
                            <p className="text-gray-500 mb-4">Processing records will appear here once you start processing batches</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {records.map((record: any) => (
                                <div key={record.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{record.processingType}</p>
                                            <p className="text-sm text-gray-500">
                                                {record.processedAt ? new Date(record.processedAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Quality: {record.qualityScore || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

