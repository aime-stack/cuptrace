'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Wallet, TrendingUp, Clock, CheckCircle, Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';

// Mock payment data - in production, this would come from an API
const mockPayments = [
    {
        id: '1',
        batchId: 'B-2024-001',
        date: new Date('2024-11-15'),
        quantity: 150,
        pricePerKg: 3500,
        amount: 525000,
        status: 'completed',
        transactionRef: 'TRX-001234'
    },
    {
        id: '2',
        batchId: 'B-2024-002',
        date: new Date('2024-11-20'),
        quantity: 200,
        pricePerKg: 3600,
        amount: 720000,
        status: 'completed',
        transactionRef: 'TRX-001235'
    },
    {
        id: '3',
        batchId: 'B-2024-003',
        date: new Date('2024-11-28'),
        quantity: 180,
        pricePerKg: 3550,
        amount: 639000,
        status: 'pending',
        transactionRef: null
    },
];

export default function FarmerPaymentsPage() {
    const { data: user } = useCurrentUser();
    const [isLoading] = useState(false);

    // Calculate stats
    const totalEarned = mockPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
    const pendingPayments = mockPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);
    const totalBatchesPaid = mockPayments.filter(p => p.status === 'completed').length;
    const averagePricePerKg = mockPayments.length > 0
        ? mockPayments.reduce((sum, p) => sum + p.pricePerKg, 0) / mockPayments.length
        : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                <p className="text-muted-foreground">
                    Track payments received for your coffee deliveries.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Earned"
                    value={formatCurrency(totalEarned, 'RWF')}
                    icon={Wallet}
                    description="All time earnings"
                    className="border-green-200"
                />
                <StatsCard
                    title="Pending Payments"
                    value={formatCurrency(pendingPayments, 'RWF')}
                    icon={Clock}
                    description="Awaiting processing"
                    className="border-yellow-200"
                />
                <StatsCard
                    title="Batches Paid"
                    value={totalBatchesPaid}
                    icon={CheckCircle}
                    description="Completed payments"
                />
                <StatsCard
                    title="Avg. Price/kg"
                    value={formatCurrency(averagePricePerKg, 'RWF')}
                    icon={TrendingUp}
                    description="Current market rate"
                />
            </div>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>
                                All payments received for your coffee batches.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : mockPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No payments yet</h3>
                            <p className="text-muted-foreground">
                                Payments will appear here when your batches are processed and sold.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price/kg</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Transaction Ref</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            {payment.batchId}
                                        </TableCell>
                                        <TableCell>
                                            {format(payment.date, "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>{payment.quantity} kg</TableCell>
                                        <TableCell>{formatCurrency(payment.pricePerKg, 'RWF')}</TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(payment.amount, 'RWF')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={
                                                payment.status === 'completed' ? 'bg-green-600' :
                                                    payment.status === 'pending' ? 'bg-yellow-600' :
                                                        'bg-gray-600'
                                            }>
                                                {payment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {payment.transactionRef || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>
                        How you receive payments from your cooperative.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-bold text-lg">M</span>
                        </div>
                        <div>
                            <p className="font-medium">Mobile Money (MTN)</p>
                            <p className="text-sm text-muted-foreground">
                                +250 788 *** ***
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                            Update
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
