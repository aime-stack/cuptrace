'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { axiosInstance } from '@/lib/axios';
import { ProductBatch } from '@/types';
import { toast } from 'sonner';

const gradingSchema = z.object({
    cuppingScore: z.coerce.number().min(0).max(100, "Score must be between 0 and 100"),
    grade: z.string().min(1, "Grade is required"),
    moisture: z.coerce.number().min(0).max(100).optional(),
    defects: z.string().optional(),
    flavorNotes: z.string().optional(), // Comma separated
    notes: z.string().optional(),
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().optional(),
}).refine((data) => {
    if (data.status === 'rejected' && !data.rejectionReason) {
        return false;
    }
    return true;
}, {
    message: "Rejection reason is required when rejecting a batch",
    path: ["rejectionReason"],
});

type GradingFormData = z.infer<typeof gradingSchema>;

export default function GradeBatchPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [batch, setBatch] = useState<ProductBatch | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<GradingFormData>({
        resolver: zodResolver(gradingSchema),
        defaultValues: {
            cuppingScore: 0,
            grade: '',
            moisture: 0,
            defects: '',
            flavorNotes: '',
            notes: '',
            status: 'approved',
            rejectionReason: '',
        },
    });

    const status = form.watch('status');

    useEffect(() => {
        const fetchBatch = async () => {
            try {
                const response = await axiosInstance.get(`/coffee/${params.id}`);
                if (response.data?.data) {
                    const batchData = response.data.data;
                    setBatch(batchData);

                    // Pre-fill form if already graded
                    if (batchData.quality) {
                        // Try to parse quality string if it contains score
                        // This is a simplification - in real app we'd have structured quality data
                        const scoreMatch = batchData.quality.match(/Score: (\d+)/);
                        if (scoreMatch) {
                            form.setValue('cuppingScore', parseInt(scoreMatch[1]));
                        }
                    }
                    if (batchData.grade) form.setValue('grade', batchData.grade);
                    if (batchData.moisture) form.setValue('moisture', batchData.moisture);
                    if (batchData.description) form.setValue('notes', batchData.description);
                }
            } catch (error) {
                console.error('Failed to fetch batch:', error);
                toast.error('Failed to load batch details');
            } finally {
                setLoading(false);
            }
        };

        fetchBatch();
    }, [params.id, form]);

    const onSubmit = async (data: GradingFormData) => {
        setSubmitting(true);
        try {
            // 1. Update batch details (score, grade, etc.)
            await axiosInstance.put(`/coffee/${params.id}`, {
                grade: data.grade,
                moisture: data.moisture,
                quality: `Score: ${data.cuppingScore} | Notes: ${data.flavorNotes}`,
                description: data.notes,
                metadata: {
                    defects: data.defects,
                    flavorNotes: data.flavorNotes?.split(',').map(s => s.trim()),
                    gradedAt: new Date().toISOString(),
                }
            });

            // 2. Approve or Reject
            if (data.status === 'approved') {
                await axiosInstance.post(`/coffee/${params.id}/approve`);
                toast.success('Batch approved and graded successfully');
            } else {
                await axiosInstance.post(`/coffee/${params.id}/reject`, {
                    reason: data.rejectionReason
                });
                toast.success('Batch rejected');
            }

            router.push('/qc/grading');
        } catch (error) {
            console.error('Failed to grade batch:', error);
            toast.error('Failed to submit grading');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!batch) {
        return <div className="text-center py-8">Batch not found</div>;
    }

    // Determine if batch is already graded (approved or rejected)
    // IMPORTANT: Check this AFTER confirming batch exists
    const isAlreadyGraded = batch.status === 'approved' || batch.status === 'rejected';


    // READ-ONLY VIEW for already graded batches
    if (isAlreadyGraded) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Batch #{batch.id.substring(0, 8)}</h1>
                        <p className="text-muted-foreground">
                            {batch.originLocation} • {batch.quantity} kg
                        </p>
                    </div>
                    <div className="ml-auto">
                        <Badge variant={batch.status === 'approved' ? 'default' : 'destructive'} className={batch.status === 'approved' ? 'bg-green-600' : 'bg-red-600'}>
                            {batch.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Batch Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Batch Details
                            </CardTitle>
                            <CardDescription>View-only information for graded batch</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground block">Processing Method</span>
                                    <span className="font-medium capitalize">{batch.processingType || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Harvest Date</span>
                                    <span className="font-medium">{batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Quantity</span>
                                    <span className="font-medium">{batch.quantity} kg</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Origin</span>
                                    <span className="font-medium">{batch.originLocation}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Moisture</span>
                                    <span className="font-medium">{batch.moisture ? `${batch.moisture}%` : 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Type</span>
                                    <span className="font-medium capitalize">{batch.type}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quality Assessment Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {batch.status === 'approved' ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                Quality Assessment
                            </CardTitle>
                            <CardDescription>
                                Graded on {batch.metadata?.gradedAt ? new Date(batch.metadata.gradedAt as string).toLocaleDateString() : 'Unknown'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground block">Grade</span>
                                    <span className="text-2xl font-bold text-primary">{batch.grade || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground block">Score</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {batch.quality?.match(/Score: (\d+)/)?.[1] || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <Separator />
                            {batch.metadata?.flavorNotes && Array.isArray(batch.metadata.flavorNotes) && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">Flavor Notes</span>
                                    <div className="flex flex-wrap gap-2">
                                        {(batch.metadata.flavorNotes as string[]).map((note, i) => (
                                            <Badge key={i} variant="secondary">{note}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {batch.metadata?.defects && (
                                <div>
                                    <span className="text-sm text-muted-foreground block">Defects</span>
                                    <span className="font-medium">{batch.metadata.defects as string}</span>
                                </div>
                            )}
                            {batch.description && (
                                <div>
                                    <span className="text-sm text-muted-foreground block">Notes</span>
                                    <p className="text-sm mt-1">{batch.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {batch.status === 'rejected' && batch.metadata?.rejectionReason && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-700">
                                <AlertTriangle className="h-5 w-5" />
                                Rejection Reason
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-red-800">{batch.metadata.rejectionReason as string}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end">
                    <Button onClick={() => router.back()}>
                        Back to Grading Queue
                    </Button>
                </div>
            </div>
        );
    }

    // EDITABLE FORM for pending batches
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Grade Batch #{batch.id.substring(0, 8)}</h1>
                    <p className="text-muted-foreground">
                        {batch.originLocation} • {batch.quantity} kg
                    </p>
                </div>
                <div className="ml-auto">
                    <Badge variant={batch.status === 'pending' ? 'secondary' : 'outline'}>
                        {batch.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Batch Info Sidebar */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Batch Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <span className="text-muted-foreground block">Processing Method</span>
                            <span className="font-medium capitalize">{batch.processingType || 'N/A'}</span>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground block">Harvest Date</span>
                            <span className="font-medium">{batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <Separator />
                        <div>
                            <span className="text-muted-foreground block">Farmer/Coop</span>
                            <span className="font-medium">{batch.farmerId ? 'Individual Farmer' : 'Cooperative'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Grading Form */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Quality Assessment</CardTitle>
                        <CardDescription>
                            Enter cupping scores and quality metrics.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="cuppingScore"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cupping Score (0-100)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    SCA Standard Score
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="grade"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grade</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select grade" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="A1">Grade A1 (Premium)</SelectItem>
                                                        <SelectItem value="A2">Grade A2 (Specialty)</SelectItem>
                                                        <SelectItem value="A3">Grade A3 (Standard)</SelectItem>
                                                        <SelectItem value="B">Grade B</SelectItem>
                                                        <SelectItem value="C">Grade C</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="moisture"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Moisture Content (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="flavorNotes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Flavor Notes</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Citrus, Floral, Chocolate" {...field} />
                                                </FormControl>
                                                <FormDescription>Comma separated</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="defects"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Defects / Issues</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Describe any physical defects..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>General Notes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Additional observations..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator className="my-4" />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Final Decision</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-4">
                                                    <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors ${field.value === 'approved' ? 'border-green-500 bg-green-50' : 'hover:bg-muted'}`} onClick={() => field.onChange('approved')}>
                                                        <CheckCircle2 className={`h-5 w-5 ${field.value === 'approved' ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                        <span className={field.value === 'approved' ? 'font-medium text-green-700' : ''}>Approve Batch</span>
                                                    </div>
                                                    <div className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer transition-colors ${field.value === 'rejected' ? 'border-red-500 bg-red-50' : 'hover:bg-muted'}`} onClick={() => field.onChange('rejected')}>
                                                        <XCircle className={`h-5 w-5 ${field.value === 'rejected' ? 'text-red-600' : 'text-muted-foreground'}`} />
                                                        <span className={field.value === 'rejected' ? 'font-medium text-red-700' : ''}>Reject Batch</span>
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {status === 'rejected' && (
                                    <FormField
                                        control={form.control}
                                        name="rejectionReason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-red-600">Rejection Reason *</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Why is this batch being rejected?" {...field} className="border-red-200 focus-visible:ring-red-500" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <div className="flex justify-end gap-4 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={submitting} className={status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}>
                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {status === 'approved' ? 'Approve & Grade' : 'Reject Batch'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
