import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { sendSuccess } from '../utils/response';

export const getDashboardStats = async (
    _req: AuthRequest,
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

        // Set short cache to prevent abuse but ensure freshness
        res.set('Cache-Control', 'public, max-age=60');

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

export const getFarmerStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const farmerId = req.user?.id;

        if (!farmerId) {
            return res.status(400).json({ success: false, message: 'User ID not found' });
        }

        const [
            totalBatches,
            pendingBatches,
            inTransitBatches,
            completedBatches
        ] = await Promise.all([
            prisma.productBatch.count({
                where: { farmerId, deletedAt: null }
            }),
            prisma.productBatch.count({
                where: { farmerId, status: 'pending', deletedAt: null }
            }),
            prisma.productBatch.count({
                where: {
                    farmerId,
                    deletedAt: null,
                    NOT: { currentStage: 'farmer' }
                }
            }),
            prisma.productBatch.count({
                where: { farmerId, status: 'completed', deletedAt: null }
            })
        ]);

        // Calculate total payments
        const payments = await prisma.payment.aggregate({
            where: {
                payeeId: farmerId,
                status: 'completed'
            },
            _sum: {
                amount: true
            }
        });

        // Set short cache
        res.set('Cache-Control', 'public, max-age=60');

        return sendSuccess(res, {
            totalBatches,
            pendingBatches,
            inTransitBatches,
            completedBatches,
            totalPayments: Number(payments._sum.amount || 0)
        });
    } catch (error) {
        next(error);
    }
};

export const getWashingStationStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const washingStationId = req.user?.id;

        if (!washingStationId) {
            return res.status(400).json({ success: false, message: 'User ID not found' });
        }

        const [
            totalBatches,
            pendingBatches
        ] = await Promise.all([
            prisma.productBatch.count({
                where: { washingStationId, deletedAt: null }
            }),
            prisma.productBatch.count({
                where: { washingStationId, status: 'pending', deletedAt: null }
            })
        ]);

        res.set('Cache-Control', 'public, max-age=60');

        return sendSuccess(res, {
            totalBatches,
            pendingBatches,
            processingBatches: 0,
            inventoryBatches: 0
        });
    } catch (error) {
        next(error);
    }
};

export const getFactoryStats = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const [
            readyToProcess,
            withQRCodes,
            nftsMinted
        ] = await Promise.all([
            prisma.productBatch.count({
                where: { status: 'approved', deletedAt: null }
            }),
            prisma.productBatch.count({
                where: {
                    status: 'approved',
                    deletedAt: null,
                    NOT: { qrCodeUrl: null }
                }
            }),
            prisma.productBatch.count({
                where: {
                    status: 'approved',
                    deletedAt: null,
                    NOT: { nftPolicyId: null }
                }
            })
        ]);

        res.set('Cache-Control', 'public, max-age=60');

        return sendSuccess(res, {
            readyToProcess,
            withQRCodes,
            nftsMinted
        });
    } catch (error) {
        next(error);
    }
};

export const getAgentStats = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const agent = req.user;
        if (!agent) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        const cooperativeId = agent.cooperativeId;
        if (!cooperativeId) {
            return res.status(400).json({ success: false, message: 'Agent not assigned to a cooperative' });
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            totalBatches,
            pendingBatches,
            approvedBatches,
            rejectedBatches,
            todayBatches
        ] = await Promise.all([
            prisma.productBatch.count({
                where: { cooperativeId, deletedAt: null }
            }),
            prisma.productBatch.count({
                where: { cooperativeId, status: 'pending', deletedAt: null }
            }),
            prisma.productBatch.count({
                where: { cooperativeId, status: 'approved', deletedAt: null }
            }),
            prisma.productBatch.count({
                where: { cooperativeId, status: 'rejected', deletedAt: null }
            }),
            prisma.productBatch.count({
                where: {
                    cooperativeId,
                    deletedAt: null,
                    createdAt: {
                        gte: startOfDay
                    }
                }
            })
        ]);

        res.set('Cache-Control', 'public, max-age=60');

        return sendSuccess(res, {
            totalBatches,
            pendingBatches,
            approvedBatches,
            rejectedBatches,
            todayBatches
        });
    } catch (error) {
        next(error);
    }
};
