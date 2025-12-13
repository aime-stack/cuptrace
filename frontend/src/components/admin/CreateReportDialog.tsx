'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCreateReport } from '@/hooks/useReports';
import { useCurrentUser } from '@/hooks/useAuth';
import { Loader2, Plus } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const reportSchema = z.object({
    reportType: z.enum([
        'monthly_summary',
        'quarterly_export',
        'annual_statistics',
        'quality_report',
        'payment_report',
        'custom'
    ]),
    periodStart: z.string().min(1, 'Start date is required'),
    periodEnd: z.string().min(1, 'End date is required'),
});

interface CreateReportDialogProps {
    trigger?: React.ReactNode;
}

export function CreateReportDialog({ trigger }: CreateReportDialogProps) {
    const [open, setOpen] = useState(false);
    const { mutate: createReport, isPending } = useCreateReport();
    const { data: user } = useCurrentUser();

    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            reportType: 'monthly_summary',
            periodStart: new Date().toISOString().split('T')[0],
            periodEnd: new Date().toISOString().split('T')[0],
        },
    });

    function onSubmit(values: z.infer<typeof reportSchema>) {
        if (!user) return;

        createReport({
            ...values,
            periodStart: new Date(values.periodStart).toISOString(),
            periodEnd: new Date(values.periodEnd).toISOString(),
            generatedBy: user.id,
            data: {}, // Initial empty data, backend/worker would populate this
            status: 'draft'
        }, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Report
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate Report</DialogTitle>
                    <DialogDescription>
                        Create a new NAEB report for a specific period.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reportType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Report Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="monthly_summary">Monthly Summary</SelectItem>
                                            <SelectItem value="quarterly_export">Quarterly Export</SelectItem>
                                            <SelectItem value="annual_statistics">Annual Statistics</SelectItem>
                                            <SelectItem value="quality_report">Quality Report</SelectItem>
                                            <SelectItem value="payment_report">Payment Report</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="periodStart"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="periodEnd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Report
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
