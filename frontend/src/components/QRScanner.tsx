'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Keyboard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * QR Scanner component - Manual entry mode
 * 
 * Note: Camera-based QR scanning via html5-qrcode has React DOM conflicts.
 * This version uses manual code entry which is more reliable.
 * For camera scanning, users can use their phone's native camera app.
 */
export default function QRScanner({ isOpen, onClose }: QRScannerProps) {
    const router = useRouter();
    const [manualCode, setManualCode] = useState('');

    const handleManualSubmit = () => {
        if (manualCode.trim()) {
            let code = manualCode.trim();

            // If user pasted a full URL, extract the hash
            if (code.includes('/trace/')) {
                const parts = code.split('/trace/');
                code = parts[parts.length - 1];
            }

            onClose();
            router.push(`/verify?code=${code}`);
        }
    };

    const handleClose = () => {
        setManualCode('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Verify Product
                    </DialogTitle>
                    <DialogDescription>
                        Enter the trace code from your product to verify its origin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Info about scanning with phone */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">
                            <strong>To scan with camera:</strong>
                        </p>
                        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                            <li>Open your phone&apos;s camera app</li>
                            <li>Point at the QR code</li>
                            <li>Tap the link that appears</li>
                        </ol>
                    </div>

                    {/* Manual Input */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">
                            Or enter the code manually:
                        </p>
                        <Input
                            placeholder="e.g., B-7c9f2a4b8e2a"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                            className="text-lg font-mono"
                        />
                        <Button
                            className="w-full"
                            onClick={handleManualSubmit}
                            disabled={!manualCode.trim()}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Verify Product
                        </Button>
                    </div>

                    {/* Example codes for testing */}
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">
                            Test with an existing batch:
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setManualCode('B-11f6c0800d39')}
                        >
                            Use Test Code
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
