'use client';

import { Ship, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';

interface ExportFormData {
    batchId: string;
    buyerName: string;
    buyerAddress: string;
    buyerEmail: string;
    shippingMethod: string;
    shippingDate: string;
    expectedArrival: string;
    trackingNumber: string;
}

export function ExportForm() {
    const form = useForm<ExportFormData>({
        defaultValues: {
            batchId: '',
            buyerName: '',
            buyerAddress: '',
            buyerEmail: '',
            shippingMethod: '',
            shippingDate: '',
            expectedArrival: '',
            trackingNumber: '',
        },
    });

    const onSubmit = (data: ExportFormData) => {
        // TODO: Implement export record creation
        console.log('Export data:', data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    Export Form
                </CardTitle>
                <CardDescription>
                    Create a new export record
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="batchId">Batch ID</Label>
                        <Input
                            id="batchId"
                            {...form.register('batchId', { required: true })}
                            placeholder="Select batch"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buyerName">Buyer Name</Label>
                        <Input
                            id="buyerName"
                            {...form.register('buyerName', { required: true })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buyerAddress">Buyer Address</Label>
                        <Textarea
                            id="buyerAddress"
                            {...form.register('buyerAddress')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buyerEmail">Buyer Email</Label>
                        <Input
                            id="buyerEmail"
                            type="email"
                            {...form.register('buyerEmail')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="shippingMethod">Shipping Method</Label>
                        <Input
                            id="shippingMethod"
                            {...form.register('shippingMethod', { required: true })}
                            placeholder="air, sea, or road"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="shippingDate">Shipping Date</Label>
                            <Input
                                id="shippingDate"
                                type="date"
                                {...form.register('shippingDate', { required: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expectedArrival">Expected Arrival</Label>
                            <Input
                                id="expectedArrival"
                                type="date"
                                {...form.register('expectedArrival')}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input
                            id="trackingNumber"
                            {...form.register('trackingNumber')}
                        />
                    </div>
                    <Button type="submit">Create Export Record</Button>
                </form>
            </CardContent>
        </Card>
    );
}

