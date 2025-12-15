import prisma from '../config/database.js';
import { AnnouncementType, PollType } from '@prisma/client';
import { ValidationError, NotFoundError } from '../utils/errors.js';

// Announcements
export const createAnnouncement = async (
    title: string,
    content: string,
    type: AnnouncementType,
    priority: string,
    authorId: string,
    cooperativeId?: string,
    expiresAt?: Date
) => {
    return await prisma.announcement.create({
        data: {
            title,
            content,
            type,
            priority,
            authorId,
            cooperativeId,
            expiresAt,
        },
        include: {
            author: {
                select: {
                    name: true,
                    role: true,
                },
            },
        },
    });
};

export const listAnnouncements = async (cooperativeId?: string) => {
    const whereClause: any = {
        // Show global announcements OR announcements for this cooperative
        OR: [
            { cooperativeId: null },
            ...(cooperativeId ? [{ cooperativeId }] : []),
        ],
        // Only show published
        publishedAt: { lte: new Date() },
    };

    // Filter expired
    // We can also do this in query or filter in memory, query is better
    // WHERE (expiresAt IS NULL OR expiresAt > now)

    return await prisma.announcement.findMany({
        where: {
            AND: [
                whereClause,
                {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                    ],
                },
            ],
        },
        orderBy: [
            { priority: 'desc' }, // Urgent first (if we map strings correctly, 'urgent' > 'normal' lexicographically? No. 'urgent' > 'normal' is true? u > n. Yes.)
            { publishedAt: 'desc' },
        ],
        include: {
            author: {
                select: {
                    name: true,
                },
            },
        },
    });
};

// Polls
export const createPoll = async (
    title: string,
    description: string | undefined,
    pollType: PollType,
    options: any,
    creatorId: string,
    cooperativeId?: string,
    endsAt?: Date
) => {
    // Default end date: 7 days from now if not provided
    const endDate = endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return await prisma.poll.create({
        data: {
            title,
            description,
            pollType,
            options, // JSON array
            createdBy: creatorId,
            cooperativeId,
            endsAt: endDate,
        },
    });
};

export const listPolls = async (cooperativeId?: string) => {
    return await prisma.poll.findMany({
        where: {
            OR: [
                { cooperativeId: null },
                ...(cooperativeId ? [{ cooperativeId }] : []),
            ],
            status: 'active',
            endsAt: { gt: new Date() }, // Only distinct active polls
        },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { votes: true }
            }
        }
    });
};

export const getPoll = async (pollId: string, userId?: string) => {
    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
        include: {
            _count: {
                select: { votes: true },
            },
        },
    });

    if (!poll) throw new NotFoundError('Poll not found');

    // Check if user voted
    let userVote = null;
    if (userId) {
        userVote = await prisma.pollVote.findUnique({
            where: {
                pollId_userId: {
                    pollId,
                    userId,
                },
            },
        });
    }

    return { ...poll, userVote };
};

export const voteOnPoll = async (pollId: string, userId: string, optionId: string) => {
    const poll = await prisma.poll.findUnique({
        where: { id: pollId },
    });

    if (!poll) throw new NotFoundError('Poll not found');
    if (poll.status !== 'active' || poll.endsAt < new Date()) {
        throw new ValidationError('Poll is closed');
    }

    // Check valid option
    const options = poll.options as any[];
    const validOption = options.find((opt: any) => opt.id === optionId);
    if (!validOption) throw new ValidationError('Invalid option');

    // Create vote (will throw if unique constraint violated)
    try {
        return await prisma.pollVote.create({
            data: {
                pollId,
                userId,
                optionId,
            },
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new ValidationError('You have already voted on this poll');
        }
        throw error;
    }
};

export const getPollResults = async (pollId: string) => {
    const votes = await prisma.pollVote.groupBy({
        by: ['optionId'],
        where: { pollId },
        _count: {
            optionId: true,
        },
    });

    return votes.map(v => ({
        optionId: v.optionId,
        count: v._count.optionId,
    }));
};

// ==========================================
// Aid Programs
// ==========================================

export const createAidProgram = async (
    title: string,
    description: string,
    provider: string,
    type: string,
    eligibility: string,
    cooperativeId?: string,
    deadline?: Date
) => {
    return await prisma.aidProgram.create({
        data: {
            title,
            description,
            provider,
            type,
            eligibility,
            cooperativeId,
            deadline,
        },
    });
};

export const listAidPrograms = async (cooperativeId?: string) => {
    return await prisma.aidProgram.findMany({
        where: {
            OR: [
                { cooperativeId: null },
                ...(cooperativeId ? [{ cooperativeId }] : []),
            ],
            status: 'open',
        },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { participants: true }
            }
        }
    });
};

export const applyForAid = async (programId: string, userId: string) => {
    // Check if program exists and is open
    const program = await prisma.aidProgram.findUnique({
        where: { id: programId }
    });

    if (!program) throw new NotFoundError('Aid program not found');
    if (program.status !== 'open') throw new ValidationError('Program is closed');
    if (program.deadline && program.deadline < new Date()) throw new ValidationError('Deadline passed');

    try {
        return await prisma.aidParticipant.create({
            data: {
                programId,
                userId,
                status: 'applied'
            }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new ValidationError('Already applied to this program');
        }
        throw error;
    }
};

// ==========================================
// Threads (Discussions)
// ==========================================

export const createThread = async (
    title: string,
    content: string,
    authorId: string,
    cooperativeId?: string
) => {
    return await prisma.thread.create({
        data: {
            title,
            content,
            authorId,
            cooperativeId,
        },
        include: {
            author: { select: { name: true, role: true } }
        }
    });
};

export const listThreads = async (cooperativeId?: string) => {
    return await prisma.thread.findMany({
        where: {
            OR: [
                { cooperativeId: null },
                ...(cooperativeId ? [{ cooperativeId }] : []),
            ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { name: true, role: true } },
            _count: { select: { comments: true } }
        }
    });
};

export const getThread = async (id: string) => {
    const thread = await prisma.thread.findUnique({
        where: { id },
        include: {
            author: { select: { name: true, role: true } },
            _count: { select: { comments: true } }
        }
    });
    if (!thread) throw new NotFoundError('Thread not found');
    return thread;
};

// ==========================================
// Comments
// ==========================================

export const createComment = async (
    content: string,
    authorId: string,
    targetType: 'announcement' | 'poll' | 'thread',
    targetId: string
) => {
    const data: any = {
        content,
        authorId,
    };

    if (targetType === 'announcement') data.announcementId = targetId;
    else if (targetType === 'poll') data.pollId = targetId;
    else if (targetType === 'thread') data.threadId = targetId;
    else throw new ValidationError('Invalid target type');

    return await prisma.comment.create({
        data,
        include: {
            author: { select: { name: true, role: true } }
        }
    });
};

export const listComments = async (
    targetType: 'announcement' | 'poll' | 'thread',
    targetId: string
) => {
    const where: any = {};
    if (targetType === 'announcement') where.announcementId = targetId;
    else if (targetType === 'poll') where.pollId = targetId;
    else if (targetType === 'thread') where.threadId = targetId;

    return await prisma.comment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        include: {
            author: { select: { name: true, role: true } }
        }
    });
};
