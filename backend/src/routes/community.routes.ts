import { Router } from 'express';
import * as communityController from '../controllers/community.controller.js';
import { verifyTokenMiddleware as authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Announcements
// List: Farmer, Agent, WS, etc. can view
router.get(
    '/announcements',
    authenticate,
    communityController.listAnnouncements
);

// Create: Admin, WS, Coop Manager (Roles: admin, ws)
router.post(
    '/announcements',
    authenticate,
    authorize(['admin', 'ws', 'agent']),
    communityController.createAnnouncement
);

// Polls
// List
router.get(
    '/polls',
    authenticate,
    communityController.listPolls
);

// Create
router.post(
    '/polls',
    authenticate,
    authorize(['admin', 'ws', 'agent']), // Allow agents for testing/field operations
    communityController.createPoll
);

// Get Single (with user vote status)
router.get(
    '/polls/:id',
    authenticate,
    communityController.getPoll
);

// Vote
router.post(
    '/polls/:id/vote',
    authenticate,
    authorize(['farmer', 'agent', 'ws']), // Who can vote? Farmers mostly.
    communityController.voteOnPoll
);

// Results
router.get(
    '/polls/:id/results',
    authenticate,
    communityController.getPollResults
);

// Aid Programs
router.get(
    '/aid-programs',
    authenticate,
    communityController.listAidPrograms
);

router.post(
    '/aid-programs',
    authenticate,
    authorize(['admin', 'ws', 'agent']),
    communityController.createAidProgram
);

router.post(
    '/aid-programs/:id/apply',
    authenticate,
    authorize(['farmer']),
    communityController.applyForAid
);

// Threads
router.get(
    '/threads',
    authenticate,
    communityController.listThreads
);

router.post(
    '/threads',
    authenticate,
    communityController.createThread
);

router.get(
    '/threads/:id',
    authenticate,
    communityController.getThread
);

// Comments
// POST /api/community/comments
router.post(
    '/comments',
    authenticate,
    communityController.createComment
);

// GET /api/community/:targetType/:targetId/comments
// e.g., /api/community/announcement/123/comments
router.get(
    '/:targetType/:targetId/comments',
    authenticate,
    communityController.listComments
);

export default router;
