import { axiosInstance } from '@/lib/axios';

export enum AnnouncementType {
    general = 'general',
    pricing = 'pricing',
    aid = 'aid',
    training = 'training',
    event = 'event',
}

export enum PollType {
    coffee_price = 'coffee_price',
    tea_price = 'tea_price',
    aid_distribution = 'aid_distribution',
    general = 'general',
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;
    priority: string;
    author: {
        name: string;
    };
    publishedAt: string;
    expiresAt?: string;
}

export interface Poll {
    id: string;
    title: string;
    description?: string;
    pollType: PollType;
    status: string;
    endsAt: string;
    options: {
        id: string;
        text: string;
    }[];
    _count?: {
        votes: number;
    };
    userVote?: {
        optionId: string;
    };
}

export interface PollResult {
    optionId: string;
    count: number;
}

export interface AidProgram {
    id: string;
    title: string;
    description: string;
    provider: string;
    type: string;
    eligibility: string;
    deadline?: string;
    status: string;
    _count?: {
        participants: number;
    };
}

export interface Thread {
    id: string;
    title: string;
    content: string;
    author: {
        name: string;
        role: string;
    };
    createdAt: string;
    _count?: {
        comments: number;
    };
}

export interface Comment {
    id: string;
    content: string;
    author: {
        name: string;
        role: string;
    };
    createdAt: string;
}

// API Calls

export const listAnnouncements = async (): Promise<Announcement[]> => {
    const { data } = await axiosInstance.get('/community/announcements');
    return data.data;
};

export const listPolls = async (): Promise<Poll[]> => {
    const { data } = await axiosInstance.get('/community/polls');
    return data.data;
};

export const getPoll = async (id: string): Promise<Poll> => {
    const { data } = await axiosInstance.get(`/community/polls/${id}`);
    return data.data;
};

export const voteOnPoll = async (pollId: string, optionId: string): Promise<any> => {
    const { data } = await axiosInstance.post(`/community/polls/${pollId}/vote`, { optionId });
    return data.data;
};

export const getPollResults = async (pollId: string): Promise<PollResult[]> => {
    const { data } = await axiosInstance.get(`/community/polls/${pollId}/results`);
    return data.data;
};

// Aid
export const listAidPrograms = async (): Promise<AidProgram[]> => {
    const { data } = await axiosInstance.get('/community/aid-programs');
    return data.data;
};

export const applyForAid = async (programId: string): Promise<any> => {
    const { data } = await axiosInstance.post(`/community/aid-programs/${programId}/apply`);
    return data.data;
};

// Threads
export const listThreads = async (): Promise<Thread[]> => {
    const { data } = await axiosInstance.get('/community/threads');
    return data.data;
};

export const createThread = async (title: string, content: string): Promise<Thread> => {
    const { data } = await axiosInstance.post('/community/threads', { title, content });
    return data.data;
};

export const getThread = async (id: string): Promise<Thread> => {
    const { data } = await axiosInstance.get(`/community/threads/${id}`);
    return data.data;
};

// Comments
export const listComments = async (targetType: string, targetId: string): Promise<Comment[]> => {
    const { data } = await axiosInstance.get(`/community/${targetType}/${targetId}/comments`);
    return data.data;
};

export const createComment = async (content: string, targetType: string, targetId: string): Promise<Comment> => {
    const { data } = await axiosInstance.post('/community/comments', {
        content,
        targetType,
        targetId
    });
    return data.data;
};
