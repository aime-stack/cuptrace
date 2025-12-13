'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import QRScanner from '@/components/QRScanner';

import { cn } from '@/lib/utils';

export default function ScannerButton({ className }: { className?: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                size="lg"
                variant="default"
                className={cn("gap-2 bg-coffee-600 hover:bg-coffee-700", className)}
                onClick={() => setIsOpen(true)}
            >
                <Camera className="h-5 w-5" />
                Scan QR Code
            </Button>
            <QRScanner isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
