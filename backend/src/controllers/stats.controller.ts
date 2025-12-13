import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';

export const getDashboardStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const [
            totalUsers,
            totalBatches,
            pendingBatches,
            totalReports,
            totalCooperatives
        ] = await Promise.all([
            prisma.user.count(),
            prisma.productBatch.count({ where: { deletedAt: null } }),
            prisma.productBatch.count({ where: { status: 'pending', deletedAt: null } }),
            prisma.nAEBReport.count(),
            prisma.cooperative.count()
        ]);

        return sendSuccess(res, {
            totalUsers,
            totalBatches,
            pendingBatches,
            totalReports,
            totalCooperatives
        });
    } catch (error) {
        next(error);
    }
};
