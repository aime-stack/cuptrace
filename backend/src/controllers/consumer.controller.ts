import { Request, Response } from 'express';
import prisma from '../config/database';
import { z } from 'zod';

// Zod schemas for validation
const ratingSchema = z.object({
    publicHash: z.string().min(1, 'Public hash is required'),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

const donationSchema = z.object({
    farmerPublicHash: z.string().min(1, 'Farmer public hash is required'),
    amount: z.number().positive(),
    currency: z.string().default('USD'),
    donorName: z.string().optional(),
    donorEmail: z.string().email().optional(),
    message: z.string().optional(),
});

export async function submitRating(req: Request, res: Response) {
    try {
        const result = ratingSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error.errors[0].message,
            });
        }

        const { publicHash, rating, comment } = result.data;

        // Find batch by public hash
        const batch = await prisma.productBatch.findUnique({
            where: { publicTraceHash: publicHash },
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found',
            });
        }

        const newRating = await prisma.rating.create({
            data: {
                batchId: batch.id,
                rating,
                comment,
            },
        });

        return res.status(201).json({
            success: true,
            data: newRating,
        });
    } catch (error) {
        console.error('Error submitting rating:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to submit rating',
        });
    }
}

export async function submitDonation(req: Request, res: Response) {
    try {
        const result = donationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error.errors[0].message,
            });
        }

        const { farmerPublicHash, amount, currency, donorName, donorEmail, message } = result.data;

        // Find farmer by public hash
        const farmer = await prisma.user.findUnique({
            where: { publicHash: farmerPublicHash },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                error: 'Farmer not found',
            });
        }

        const donation = await prisma.donation.create({
            data: {
                farmerId: farmer.id,
                amount,
                currency,
                donorName,
                donorEmail,
                message,
                status: 'pledged',
            },
        });

        return res.status(201).json({
            success: true,
            data: donation,
        });

    } catch (error) {
        console.error('Error submitting donation:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to submit donation',
        });
    }
}
