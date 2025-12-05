'use client';

import Link from 'next/link';
import { FileCheck, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as certificateService from '@/services/certificate.service';
import { useQuery } from '@tanstack/react-query';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function CertificatesPage() {
    const { data: certificates, isLoading } = useQuery({
        queryKey: ['certificates'],
        queryFn: () => certificateService.listCertificates(),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
                    <p className="text-muted-foreground">
                        Manage export certificates
                    </p>
                </div>
                <Button className="gap-2" asChild>
                    <Link href="/exporter/certificates/new">
                        <Plus className="h-4 w-4" />
                        Create Certificate
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Certificates</CardTitle>
                    <CardDescription>
                        All available certificates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !certificates || certificates.length === 0 ? (
                        <div className="text-center py-12">
                            <FileCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
                            <p className="text-gray-500 mb-4">Upload your first certificate</p>
                            <Button className="gap-2" asChild>
                                <Link href="/exporter/certificates/new">
                                    <Plus className="h-4 w-4" />
                                    Create Certificate
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Certificate Number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Issued Date</TableHead>
                                    <TableHead>Expiry Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {certificates.map((cert: any) => (
                                    <TableRow key={cert.id}>
                                        <TableCell className="font-medium">{cert.certificateNumber || cert.id.substring(0, 8)}</TableCell>
                                        <TableCell className="capitalize">{cert.certificateType || 'N/A'}</TableCell>
                                        <TableCell>
                                            {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" asChild>
                                                <Link href={`/exporter/certificates/${cert.id}`}>
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

