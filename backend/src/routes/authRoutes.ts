/**
 * Authentication Routes
 */

import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', authController.registerValidation, authController.register);
router.post('/login', authController.loginValidation, authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/location', authenticateToken, authController.updateLocation);
router.put('/availability', authenticateToken, authController.updateAvailability);
router.put('/fcm-token', authenticateToken, authController.updateFcmToken);

export default router;
