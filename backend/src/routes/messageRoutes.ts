/**
 * Message Routes
 */

import { Router } from 'express';
import * as messageController from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', messageController.sendMessage);
router.get('/mission/:missionId', messageController.getMissionMessages);
router.get('/unread-count', messageController.getUnreadCount);

export default router;
