'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CertificateForm } from '@/components/certificates/CertificateForm';
import { useQuery } from '@tanstack/react-query';
import * as certificateService from '@/services/certificate.service';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function CertificateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const certificateId = params.id as string;
    const [isEditing, setIsEditing] = useState(false);

    const { data: certificate, isLoading, error } = useQuery({
        queryKey: ['certificate', certificateId],
        queryFn: () => certificateService.getCertificate(certificateId),
        enabled: !!certificateId,
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/exporter/certificates">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                </div>
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/exporter/certificates">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                </div>
                <div className="text-center py-12">
                    <p className="text-red-600">Certificate not found or error loading certificate</p>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Certificate</h1>
                        </div>
                    </div>
                </div>

                <CertificateForm 
                    certificate={certificate}
                    onSuccess={() => {
                        setIsEditing(false);
                        router.refresh();
                    }}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/exporter/certificates">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Certificates
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Certificate Details</h1>
                        <p className="text-muted-foreground">
                            View complete information about this certificate
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{certificate.certificateNumber}</CardTitle>
                    <CardDescription>
                        {certificate.certificateType.replace('_', ' ').toUpperCase()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Batch ID</p>
                            <p className="text-sm text-gray-600">{certificate.batchId}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Issued By</p>
                            <p className="text-sm text-gray-600">{certificate.issuedBy}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Issued Date</p>
                            <p className="text-sm text-gray-600">{formatDate(certificate.issuedDate)}</p>
                        </div>
                        {certificate.expiryDate && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                                <p className="text-sm text-gray-600">{formatDate(certificate.expiryDate)}</p>
                            </div>
                        )}
                        {certificate.documentUrl && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">Document URL</p>
                                <a 
                                    href={certificate.documentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    {certificate.documentUrl}
                                </a>
                            </div>
                        )}
                        {certificate.blockchainTxHash && (
                            <div>
                                <p className="text-sm font-medium text-gray-700">Blockchain Transaction</p>
                                <p className="text-sm text-gray-600 font-mono break-all">{certificate.blockchainTxHash}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

