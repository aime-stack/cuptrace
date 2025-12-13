import { Response } from 'express';
import * as communityService from '../services/community.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { AnnouncementType, PollType } from '@prisma/client';

// Announcements
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, type, priority, cooperativeId, expiresAt } = req.body;
        const authorId = req.user!.id;

        // Validate type
        if (!Object.values(AnnouncementType).includes(type)) {
            return sendError(res, 'Invalid announcement type');
        }

        // Default cooperativeId to user's cooperative if not provided and user is WS/Agent
        // For admin, it can be null (global) or specific
        let targetCooperativeId = cooperativeId;
        if (!targetCooperativeId && req.user!.role !== 'admin') {
            targetCooperativeId = req.user!.cooperativeId;
        }

        const announcement = await communityService.createAnnouncement(
            title,
            content,
            type,
            priority,
            authorId,
            targetCooperativeId || undefined,
            expiresAt ? new Date(expiresAt) : undefined
        );

        return sendSuccess(res, announcement, 201);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const listAnnouncements = async (req: AuthRequest, res: Response) => {
    try {
        // If user is admin, they might want to see all or filter.
        // For now, let's just show announcements relevant to the user's cooperative Context
        // or if they are admin, maybe all?
        // Let's stick to: show what's relevant to the user.
        const cooperativeId = req.user!.cooperativeId; // May be null for admin or some roles

        const announcements = await communityService.listAnnouncements(cooperativeId || undefined);
        return sendSuccess(res, announcements);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

// Polls
export const createPoll = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, pollType, options, cooperativeId, endsAt } = req.body;
        const creatorId = req.user!.id;

        if (!Object.values(PollType).includes(pollType)) {
            return sendError(res, 'Invalid poll type');
        }

        if (!Array.isArray(options) || options.length < 2) {
            return sendError(res, 'Poll must have at least 2 options');
        }

        let targetCooperativeId = cooperativeId;
        if (!targetCooperativeId && req.user!.role !== 'admin') {
            targetCooperativeId = req.user!.cooperativeId;
        }

        const poll = await communityService.createPoll(
            title,
            description,
            pollType,
            options,
            creatorId,
            targetCooperativeId || undefined,
            endsAt ? new Date(endsAt) : undefined
        );

        return sendSuccess(res, poll, 201);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const listPolls = async (req: AuthRequest, res: Response) => {
    try {
        const cooperativeId = req.user!.cooperativeId;
        const polls = await communityService.listPolls(cooperativeId || undefined);
        return sendSuccess(res, polls);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const getPoll = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const poll = await communityService.getPoll(id, userId);
        return sendSuccess(res, poll);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const voteOnPoll = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // Poll ID
        const { optionId } = req.body;
        const userId = req.user!.id;

        const vote = await communityService.voteOnPoll(id, userId, optionId);
        return sendSuccess(res, vote);
    } catch (error: any) {
        return sendError(res, error.message, error.statusCode || 500);
    }
};

export const getPollResults = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const results = await communityService.getPollResults(id);
        return sendSuccess(res, results);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

// ==========================================
// Aid Programs
// ==========================================

export const createAidProgram = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, provider, type, eligibility, cooperativeId, deadline } = req.body;

        // Defaults to user's cooperative if not admin
        let targetCooperativeId = cooperativeId;
        if (!targetCooperativeId && req.user!.role !== 'admin') {
            targetCooperativeId = req.user!.cooperativeId;
        }

        const program = await communityService.createAidProgram(
            title,
            description,
            provider,
            type,
            eligibility,
            targetCooperativeId || undefined,
            deadline ? new Date(deadline) : undefined
        );
        return sendSuccess(res, program, 201);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const listAidPrograms = async (req: AuthRequest, res: Response) => {
    try {
        const cooperativeId = req.user!.cooperativeId;
        const programs = await communityService.listAidPrograms(cooperativeId || undefined);
        return sendSuccess(res, programs);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const applyForAid = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;
        const application = await communityService.applyForAid(id, userId);
        return sendSuccess(res, application, 201);
    } catch (error: any) {
        return sendError(res, error.message, error.statusCode || 500);
    }
};

// ==========================================
// Threads
// ==========================================

export const createThread = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, cooperativeId } = req.body;
        const authorId = req.user!.id;

        let targetCooperativeId = cooperativeId;
        if (!targetCooperativeId && req.user!.role !== 'admin') {
            targetCooperativeId = req.user!.cooperativeId;
        }

        const thread = await communityService.createThread(
            title,
            content,
            authorId,
            targetCooperativeId || undefined
        );
        return sendSuccess(res, thread, 201);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const listThreads = async (req: AuthRequest, res: Response) => {
    try {
        const cooperativeId = req.user!.cooperativeId;
        const threads = await communityService.listThreads(cooperativeId || undefined);
        return sendSuccess(res, threads);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const getThread = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const thread = await communityService.getThread(id);
        return sendSuccess(res, thread);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

// ==========================================
// Comments
// ==========================================

export const createComment = async (req: AuthRequest, res: Response) => {
    try {
        const { content, targetType, targetId } = req.body;
        const authorId = req.user!.id;

        const comment = await communityService.createComment(
            content,
            authorId,
            targetType,
            targetId
        );
        return sendSuccess(res, comment, 201);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};

export const listComments = async (req: AuthRequest, res: Response) => {
    try {
        const { targetType, targetId } = req.params;
        const comments = await communityService.listComments(
            targetType as 'announcement' | 'poll' | 'thread',
            targetId
        );
        return sendSuccess(res, comments);
    } catch (error: any) {
        return sendError(res, error.message);
    }
};
