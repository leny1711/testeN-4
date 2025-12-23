/**
 * Payment Controller
 */

import { Request, Response } from 'express';
import * as paymentService from '../services/paymentService';
import { asyncHandler } from '../middleware/errorHandler';
import stripe from '../config/stripe';

/**
 * Create payment intent
 */
export const createPaymentIntent = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId } = req.body;

    if (!missionId) {
      return res.status(400).json({
        success: false,
        message: 'Mission ID is required',
      });
    }

    const result = await paymentService.createPaymentIntent(missionId, userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Confirm payment
 */
export const confirmPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { paymentId } = req.params;

    const payment = await paymentService.confirmPayment(paymentId);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: payment,
    });
  }
);

/**
 * Get payment by mission ID
 */
export const getPaymentByMissionId = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId } = req.params;

    const payment = await paymentService.getPaymentByMissionId(
      missionId,
      userId
    );

    res.status(200).json({
      success: true,
      data: payment,
    });
  }
);

/**
 * Get user payment history
 */
export const getPaymentHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const payments = await paymentService.getUserPaymentHistory(userId);

    res.status(200).json({
      success: true,
      data: payments,
    });
  }
);

/**
 * Get provider earnings
 */
export const getProviderEarnings = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const earnings = await paymentService.getProviderEarnings(userId);

    res.status(200).json({
      success: true,
      data: earnings,
    });
  }
);

/**
 * Request payout
 */
export const requestPayout = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const result = await paymentService.requestPayout(userId, parseFloat(amount));

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

/**
 * Stripe webhook handler
 */
export const stripeWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      return res.status(400).json({
        success: false,
        message: 'Missing stripe signature',
      });
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      await paymentService.handleStripeWebhook(event);

      res.json({ received: true });
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      res.status(400).json({
        success: false,
        message: `Webhook Error: ${err.message}`,
      });
    }
  }
);
