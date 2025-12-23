/**
 * Rating Routes
 */

import { Router } from 'express';
import * as ratingController from '../controllers/ratingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', ratingController.createRating);
router.get('/user/:userId', ratingController.getUserRatings);

export default router;
