'use client';

import { Wallet, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useAuth';
import * as paymentService from '@/services/payment.service';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';

export default function PaymentsPage() {
    const { data: user } = useCurrentUser();
    const { data: payments, isLoading } = useQuery({
        queryKey: ['payments', user?.id],
        queryFn: () => paymentService.listPayments({ payeeId: user?.id }),
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <p className="text-muted-foreground">
                    Track payments received for your batches
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>
                        All payments received for your batches
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !payments || payments.length === 0 ? (
                        <div className="text-center py-12">
                            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h3>
                            <p className="text-gray-500 mb-4">
                                Payments will appear here once your batches are processed and paid
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment: any) => (
                                <div key={payment.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="font-semibold text-lg">{formatCurrency(payment.amount)}</p>
                                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    payment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                {payment.paymentType && (
                                                    <p>Type: <span className="capitalize">{payment.paymentType.replace('_', ' ')}</span></p>
                                                )}
                                                {payment.batchId && (
                                                    <p>Batch: {payment.batchId.substring(0, 8)}</p>
                                                )}
                                                {payment.notes && (
                                                    <p className="text-gray-500 italic">{payment.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-700">
                                                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                            {payment.transactionRef && (
                                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                                    {payment.transactionRef.substring(0, 12)}...
                                                </p>
                                            )}
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

