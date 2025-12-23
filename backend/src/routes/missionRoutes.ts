/**
 * Mission Routes
 */

import { Router } from 'express';
import * as missionController from '../controllers/missionController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Mission CRUD
router.post('/', missionController.createMissionValidation, missionController.createMission);
router.get('/', missionController.getUserMissions);
router.get('/nearby', authorizeRole('PROVIDER'), missionController.getNearbyMissions);
router.get('/:missionId', missionController.getMissionById);

// Mission actions
router.post('/:missionId/accept', authorizeRole('PROVIDER'), missionController.acceptMission);
router.post('/:missionId/start', authorizeRole('PROVIDER'), missionController.startMission);
router.post('/:missionId/complete', authorizeRole('PROVIDER'), missionController.completeMission);
router.post('/:missionId/cancel', missionController.cancelMission);

export default router;
