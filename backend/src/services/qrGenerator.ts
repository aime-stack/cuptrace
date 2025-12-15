/**
 * QR Code Generator Service for CupTrace
 * 
 * Generates QR code images (PNG and SVG) and uploads them to Supabase Storage.
 * QR codes contain trace URLs for consumer scanning.
 */

import QRCode from 'qrcode';
import { uploadQRCode, isSupabaseConfigured } from './supabaseStorage.js';
import { generateBatchTraceHash } from '../lib/hashing.js';
import prisma from '../config/database.js';

// Get frontend host from environment
const FRONTEND_HOST = process.env.FRONTEND_HOST || 'http://localhost:3000';

/**
 * Options for QR code generation
 */
interface QRGenerationOptions {
    width?: number;
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
}

const DEFAULT_OPTIONS: QRGenerationOptions = {
    width: 400,
    margin: 2,
    color: {
        dark: '#1a1a2e',   // Dark coffee color
        light: '#ffffff',
    },
};

/**
 * Generate QR code as PNG buffer
 * 
 * @param content - Content to encode in the QR code
 * @param options - QR code generation options
 * @returns PNG buffer
 */
export async function generateQRCodePNG(
    content: string,
    options: QRGenerationOptions = {}
): Promise<Buffer> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    return QRCode.toBuffer(content, {
        type: 'png',
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: 'H', // High error correction for better scanning
    });
}

/**
 * Generate QR code as SVG string
 * 
 * @param content - Content to encode in the QR code
 * @param options - QR code generation options
 * @returns SVG string
 */
export async function generateQRCodeSVG(
    content: string,
    options: QRGenerationOptions = {}
): Promise<string> {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    return QRCode.toString(content, {
        type: 'svg',
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: 'H',
    });
}

/**
 * Build the trace URL for a batch
 * 
 * @param publicTraceHash - The batch's public trace hash (B-XXXX format)
 * @returns Full trace URL
 */
export function buildTraceUrl(publicTraceHash: string): string {
    return `${FRONTEND_HOST}/trace/${publicTraceHash}`;
}

/**
 * Generate QR codes (PNG and SVG) and upload to Supabase Storage
 * 
 * @param batchId - The internal batch ID
 * @param publicTraceHash - Optional pre-generated public trace hash
 * @returns URLs for the uploaded QR codes and the trace hash
 */
export async function generateAndUploadQR(
    batchId: string,
    publicTraceHash?: string
): Promise<{
    pngUrl: string;
    svgUrl: string | null;
    traceUrl: string;
    publicTraceHash: string;
}> {
    // Generate trace hash if not provided
    const traceHash = publicTraceHash || generateBatchTraceHash(batchId);

    // Build the trace URL that will be encoded in the QR code
    const traceUrl = buildTraceUrl(traceHash);

    // Generate QR code images
    const pngBuffer = await generateQRCodePNG(traceUrl);
    const svgContent = await generateQRCodeSVG(traceUrl);

    let pngUrl: string;
    let svgUrl: string | null = null;

    // Upload to Supabase if configured
    if (isSupabaseConfigured()) {
        // Upload PNG
        pngUrl = await uploadQRCode(
            pngBuffer,
            `${traceHash}.png`,
            'image/png',
            true
        );

        // Upload SVG
        svgUrl = await uploadQRCode(
            Buffer.from(svgContent, 'utf-8'),
            `${traceHash}.svg`,
            'image/svg+xml',
            true
        );
    } else {
        // Fallback: generate data URL for PNG (not ideal for production)
        console.warn('Supabase not configured. Using data URL fallback.');
        pngUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
    }

    return {
        pngUrl,
        svgUrl,
        traceUrl,
        publicTraceHash: traceHash,
    };
}

/**
 * Generate QR code for a batch and update the database
 * 
 * @param batchId - The batch ID to generate QR for
 * @returns Updated batch with QR code URL
 */
export async function generateQRCodeForBatch(batchId: string): Promise<{
    success: boolean;
    qrCodeUrl?: string;
    publicTraceHash?: string;
    traceUrl?: string;
    error?: string;
}> {
    try {
        // Check if batch exists
        const batch = await prisma.productBatch.findUnique({
            where: { id: batchId },
        });

        if (!batch) {
            return { success: false, error: 'Batch not found' };
        }

        // Check if QR already exists
        if (batch.qrCodeUrl && batch.publicTraceHash) {
            return {
                success: true,
                qrCodeUrl: batch.qrCodeUrl,
                publicTraceHash: batch.publicTraceHash,
                traceUrl: buildTraceUrl(batch.publicTraceHash),
            };
        }

        // Generate and upload QR codes
        const { pngUrl, publicTraceHash, traceUrl } = await generateAndUploadQR(
            batchId,
            batch.publicTraceHash || undefined
        );

        // Update batch in database
        await prisma.productBatch.update({
            where: { id: batchId },
            data: {
                qrCodeUrl: pngUrl,
                publicTraceHash: publicTraceHash,
                verificationUrl: traceUrl,
                qrCodeGeneratedAt: new Date(),
            },
        });

        return {
            success: true,
            qrCodeUrl: pngUrl,
            publicTraceHash: publicTraceHash,
            traceUrl: traceUrl,
        };
    } catch (error) {
        console.error('Error generating QR code for batch:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Regenerate QR code for a batch (force regeneration)
 * 
 * @param batchId - The batch ID to regenerate QR for
 * @returns Updated batch with new QR code URL
 */
export async function regenerateQRCodeForBatch(batchId: string): Promise<{
    success: boolean;
    qrCodeUrl?: string;
    publicTraceHash?: string;
    error?: string;
}> {
    try {
        // Check if batch exists
        const batch = await prisma.productBatch.findUnique({
            where: { id: batchId },
        });

        if (!batch) {
            return { success: false, error: 'Batch not found' };
        }

        // Generate new QR (use existing trace hash if present)
        const { pngUrl, publicTraceHash, traceUrl } = await generateAndUploadQR(
            batchId,
            batch.publicTraceHash || undefined
        );

        // Update batch
        await prisma.productBatch.update({
            where: { id: batchId },
            data: {
                qrCodeUrl: pngUrl,
                publicTraceHash: publicTraceHash,
                verificationUrl: traceUrl,
                qrCodeGeneratedAt: new Date(),
            },
        });

        return {
            success: true,
            qrCodeUrl: pngUrl,
            publicTraceHash: publicTraceHash,
        };
    } catch (error) {
        console.error('Error regenerating QR code:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export default {
    generateQRCodePNG,
    generateQRCodeSVG,
    generateAndUploadQR,
    generateQRCodeForBatch,
    regenerateQRCodeForBatch,
    buildTraceUrl,
};
