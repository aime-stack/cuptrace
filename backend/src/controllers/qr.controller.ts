/**
 * QR Code Controller for CupTrace
 * 
 * Handles QR code generation and public trace endpoints.
 */

import { Request, Response } from 'express';
import { generateQRCodeForBatch, regenerateQRCodeForBatch, buildTraceUrl } from '../services/qrGenerator';
import { formatFarmerDisplayName } from '../lib/hashing';
import prisma from '../config/database';

/**
 * Generate QR code for a batch
 * POST /api/batches/:id/generate-qr
 */
export async function generateQR(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { force } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Batch ID is required',
            });
        }

        let result;
        if (force) {
            result = await regenerateQRCodeForBatch(id);
        } else {
            result = await generateQRCodeForBatch(id);
        }

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json({
            success: true,
            data: {
                batchId: id,
                qrCodeUrl: result.qrCodeUrl,
                publicTraceHash: result.publicTraceHash,
                traceUrl: result.publicTraceHash ? buildTraceUrl(result.publicTraceHash) : undefined,
            },
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate QR code',
        });
    }
}

/**
 * Get public trace information for a batch
 * GET /api/trace/:publicHash
 * 
 * This is a PUBLIC endpoint - no PII should be exposed!
 */
export async function getPublicTrace(req: Request, res: Response) {
    try {
        const { publicHash } = req.params;

        if (!publicHash) {
            return res.status(400).json({
                success: false,
                error: 'Public hash is required',
            });
        }

        // Find batch by public trace hash
        const batch = await prisma.productBatch.findFirst({
            where: { publicTraceHash: publicHash },
            include: {
                farmer: {
                    select: {
                        publicHash: true,
                        // NO PII: name, phone, email, address, etc. are NOT included
                    },
                },
                cooperative: {
                    select: {
                        name: true,
                        location: true,
                    },
                },
                history: {
                    orderBy: { timestamp: 'asc' },
                    select: {
                        id: true,
                        stage: true,
                        timestamp: true,
                        notes: true,
                        // NO PII: changedBy is not included
                    },
                },
                events: {
                    orderBy: { timestamp: 'asc' },
                    select: {
                        id: true,
                        eventType: true,
                        timestamp: true,
                        description: true,
                        location: true,
                        // NO PII: operatorId is not included
                    },
                },
                certificates: {
                    select: {
                        id: true,
                        certificateType: true,
                        certificateNumber: true,
                        issuedBy: true,
                        issuedDate: true,
                        expiryDate: true,
                    },
                },
            },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        // Build privacy-safe response
        const response = {
            success: true,
            data: {
                // Batch identification (public)
                publicTraceHash: batch.publicTraceHash,
                lotId: batch.lotId,
                type: batch.type,
                status: batch.status,

                // Origin (broad region only, no exact address)
                origin: {
                    region: batch.region || null,
                    country: 'Rwanda',
                    // NO exact address, cell, village, coordinates
                },

                // Product details
                product: {
                    grade: batch.grade,
                    quality: batch.quality,
                    processingType: batch.processingType,
                    teaType: batch.teaType,
                    quantity: batch.quantity,
                    harvestDate: batch.harvestDate,
                },

                // Farmer (anonymous using public hash)
                farmer: batch.farmer ? {
                    displayName: formatFarmerDisplayName(batch.farmer.publicHash || ''),
                    publicHash: batch.farmer.publicHash,
                    // NO name, phone, email, address
                } : null,

                // Cooperative (public org info)
                cooperative: batch.cooperative ? {
                    name: batch.cooperative.name,
                    region: batch.cooperative.location,
                } : null,

                // Quality & Verification
                qc: {
                    isApproved: batch.status === 'approved' || batch.status === 'completed',
                    qrCodeUrl: batch.qrCodeUrl,
                },

                // Blockchain & NFT
                blockchain: {
                    txHash: batch.blockchainTxHash,
                    nftPolicyId: batch.nftPolicyId,
                    nftAssetName: batch.nftAssetName,
                    nftMintedAt: batch.nftMintedAt,
                },

                // Timeline (sanitized)
                timeline: batch.history.map(h => ({
                    id: h.id,
                    stage: h.stage,
                    timestamp: h.timestamp,
                    notes: h.notes,
                })),

                // Events (sanitized)
                events: batch.events.map(e => ({
                    id: e.id,
                    type: e.eventType,
                    timestamp: e.timestamp,
                    description: e.description,
                    location: e.location,
                })),

                // Certificates
                certificates: batch.certificates,

                // Metadata
                description: batch.description,
                tags: batch.tags,
                createdAt: batch.createdAt,
                updatedAt: batch.updatedAt,
            },
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching public trace:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch trace information',
        });
    }
}

/**
 * Get batch by QR code or lot ID (for verification)
 * GET /api/verify/:code
 */
export async function verifyByCode(req: Request, res: Response) {
    try {
        const { code } = req.params;
        const { type } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Code is required',
            });
        }

        // Try to find batch by various identifiers
        const batch = await prisma.productBatch.findFirst({
            where: {
                OR: [
                    { publicTraceHash: code },
                    { qrCode: code },
                    { lotId: code },
                    { id: code },
                ],
                ...(type ? { type: type as 'coffee' | 'tea' } : {}),
            },
            select: {
                publicTraceHash: true,
            },
        });

        if (!batch || !batch.publicTraceHash) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        // Redirect to public trace
        return res.status(200).json({
            success: true,
            data: {
                publicTraceHash: batch.publicTraceHash,
                traceUrl: buildTraceUrl(batch.publicTraceHash),
            },
        });
    } catch (error) {
        console.error('Error verifying code:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to verify code',
        });
    }
}

export default {
    generateQR,
    getPublicTrace,
    verifyByCode,
};
