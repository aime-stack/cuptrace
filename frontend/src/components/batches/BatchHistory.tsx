'use client';

import { Clock, MapPin, Package, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BatchHistory as BatchHistoryType } from '@/types';
import { formatDate, getStageLabel } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import * as stageService from '@/services/stage.service';

interface BatchHistoryProps {
    batchId: string;
    initialHistory?: BatchHistoryType[];
}

export function BatchHistory({ batchId, initialHistory }: BatchHistoryProps) {
    const { data: history, isLoading } = useQuery({
        queryKey: ['batchHistory', batchId],
        queryFn: () => stageService.getBatchHistory(batchId),
        initialData: initialHistory,
    });

    if (isLoading && !initialHistory) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const historyList = history || initialHistory || [];

    if (historyList.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Batch History</CardTitle>
                    <CardDescription>Track the journey through the supply chain</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No history records found for this batch.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Supply Chain Journey</CardTitle>
                <CardDescription>Track the journey from farm to export</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {historyList.map((record, index) => (
                        <div key={record.id} className="flex items-start gap-4">
                            {/* Timeline indicator */}
                            <div className="flex-shrink-0 relative">
                                {index === 0 ? (
                                    <div className="w-8 h-8 rounded-full bg-coffee-600 text-white flex items-center justify-center text-sm font-bold">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">
                                        {index + 1}
                                    </div>
                                )}
                                {index < historyList.length - 1 && (
                                    <div className="absolute left-4 top-8 w-0.5 bg-gray-200" style={{ height: 'calc(100% + 1.5rem)' }} />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900">
                                        {getStageLabel(record.stage)}
                                    </h4>
                                    {index === 0 && (
                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                            Current
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                    {formatDate(record.timestamp)}
                                </p>

                                {record.location && (
                                    <div className="flex items-start gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <p className="text-sm text-gray-600">{record.location}</p>
                                    </div>
                                )}

                                {record.quantity && (
                                    <div className="flex items-start gap-2 mb-2">
                                        <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <p className="text-sm text-gray-600">Quantity: {record.quantity} kg</p>
                                    </div>
                                )}

                                {record.quality && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Quality: {record.quality}
                                    </p>
                                )}

                                {record.notes && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-700">{record.notes}</p>
                                    </div>
                                )}

                                {record.action && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Action: {record.action}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

