/**
 * Payment Routes
 */

import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// Stripe webhook (no auth required)
router.post('/webhook', paymentController.stripeWebhook);

// Protected routes
router.use(authenticateToken);

router.post('/create-intent', paymentController.createPaymentIntent);
router.post('/:paymentId/confirm', paymentController.confirmPayment);
router.get('/mission/:missionId', paymentController.getPaymentByMissionId);
router.get('/history', paymentController.getPaymentHistory);
router.get('/earnings', authorizeRole('PROVIDER'), paymentController.getProviderEarnings);
router.post('/payout', authorizeRole('PROVIDER'), paymentController.requestPayout);

export default router;
