'use client';

import { Settings, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';

interface ProcessingFormData {
    processingType: string;
    quantityIn: number;
    quantityOut: number;
    qualityScore: number;
    notes: string;
}

export function ProcessingForm() {
    const form = useForm<ProcessingFormData>({
        defaultValues: {
            processingType: '',
            quantityIn: 0,
            quantityOut: 0,
            qualityScore: 0,
            notes: '',
        },
    });

    const onSubmit = (data: ProcessingFormData) => {
        // TODO: Implement processing record creation
        console.log('Processing data:', data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Processing Form
                </CardTitle>
                <CardDescription>
                    Record processing activities for batches
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="processingType">Processing Type</Label>
                        <Input
                            id="processingType"
                            {...form.register('processingType', { required: true })}
                            placeholder="e.g. Wet Processing, Drying"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quantityIn">Quantity In (kg)</Label>
                            <Input
                                id="quantityIn"
                                type="number"
                                {...form.register('quantityIn', { required: true, valueAsNumber: true })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantityOut">Quantity Out (kg)</Label>
                            <Input
                                id="quantityOut"
                                type="number"
                                {...form.register('quantityOut', { required: true, valueAsNumber: true })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="qualityScore">Quality Score</Label>
                        <Input
                            id="qualityScore"
                            type="number"
                            step="0.1"
                            {...form.register('qualityScore', { valueAsNumber: true })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            {...form.register('notes')}
                            placeholder="Additional processing notes..."
                        />
                    </div>
                    <Button type="submit">Record Processing</Button>
                </form>
            </CardContent>
        </Card>
    );
}

