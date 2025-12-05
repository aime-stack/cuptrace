'use client';

import { FileText, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as reportService from '@/services/report.service';
import { useQuery } from '@tanstack/react-query';

export default function ReportsPage() {
    const { data: reports, isLoading } = useQuery({
        queryKey: ['reports'],
        queryFn: () => reportService.listReports(),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">NAEB Reports</h1>
                    <p className="text-muted-foreground">
                        Generate and view reports
                    </p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Report
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>
                        View and manage NAEB reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !reports || reports.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                            <p className="text-gray-500 mb-4">Generate your first report to get started</p>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report: any) => (
                                <div key={report.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{report.reportType}</p>
                                            <p className="text-sm text-gray-500">
                                                {report.periodStart && report.periodEnd 
                                                    ? `${new Date(report.periodStart).toLocaleDateString()} - ${new Date(report.periodEnd).toLocaleDateString()}`
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                report.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {report.status}
                                            </span>
                                            <Button size="sm" variant="ghost">View</Button>
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

