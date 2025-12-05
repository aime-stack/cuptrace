'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificateForm } from '@/components/certificates/CertificateForm';
import Link from 'next/link';

export default function NewCertificatePage() {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/exporter/certificates">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Certificates
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Certificate</h1>
                    <p className="text-muted-foreground">
                        Add a new certificate for a product batch
                    </p>
                </div>
            </div>

            <CertificateForm 
                onSuccess={() => router.push('/exporter/certificates')}
                onCancel={() => router.push('/exporter/certificates')}
            />
        </div>
    );
}

