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

        // Optimize: Use groupBy to fetch all stats in a single query
        const stats = await prisma.productBatch.groupBy({
            by: ['status', 'currentStage'],
            where: {
                farmerId,
                deletedAt: null
            },
            _count: {
                _all: true
            }
        });

        // Initialize counters
        let totalBatches = 0;
        let pendingBatches = 0;
        let inTransitBatches = 0;
        let completedBatches = 0;

        // Aggregate results in memory
        stats.forEach(group => {
            const count = group._count._all;
            totalBatches += count;

            if (group.status === 'pending') {
                pendingBatches += count;
            }
            if (group.status === 'completed') {
                completedBatches += count;
            }
            // In transit logic: NOT currentStage='farmer'
            if (group.currentStage !== 'farmer') {
                inTransitBatches += count;
            }
        });

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

        // Optimize: Use groupBy for status counts (1 query instead of 4)
        const statusStats = await prisma.productBatch.groupBy({
            by: ['status'],
            where: {
                cooperativeId,
                deletedAt: null
            },
            _count: {
                _all: true
            }
        });

        // Initialize counters
        let totalBatches = 0;
        let pendingBatches = 0;
        let approvedBatches = 0;
        let rejectedBatches = 0;

        // Aggregate results in memory
        statusStats.forEach(group => {
            const count = group._count._all;
            totalBatches += count;

            if (group.status === 'pending') pendingBatches += count;
            if (['approved', 'processing', 'ready_for_export', 'exported', 'delivered'].includes(group.status)) {
                approvedBatches += count;
            }
            if (group.status === 'rejected') rejectedBatches += count;
        });

        // Fetch today's count separately (date filter) - 2nd query
        const todayBatches = await prisma.productBatch.count({
            where: {
                cooperativeId,
                deletedAt: null,
                createdAt: {
                    gte: startOfDay
                }
            }
        });

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
