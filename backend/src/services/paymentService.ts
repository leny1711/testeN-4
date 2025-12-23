/**
 * Payment Service
 * Handles Stripe payment processing
 */

import stripe, { calculateFees } from '../config/stripe';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { sendPushNotification } from '../config/firebase';

/**
 * Create payment intent for a mission
 */
export const createPaymentIntent = async (
  missionId: string,
  clientId: string
) => {
  // Get mission
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      client: true,
      provider: true,
    },
  });

  if (!mission) {
    throw new AppError('Mission not found', 404);
  }

  if (mission.clientId !== clientId) {
    throw new AppError('Access denied', 403);
  }

  if (mission.status !== 'COMPLETED') {
    throw new AppError('Mission must be completed before payment', 400);
  }

  // Check if payment already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { missionId },
  });

  if (existingPayment) {
    throw new AppError('Payment already exists for this mission', 400);
  }

  // Get or create Stripe customer
  let stripeCustomerId = mission.client.stripeCustomerId;
  
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: mission.client.email,
      name: `${mission.client.firstName} ${mission.client.lastName}`,
      metadata: {
        userId: mission.client.id,
      },
    });
    
    stripeCustomerId = customer.id;
    
    await prisma.user.update({
      where: { id: clientId },
      data: { stripeCustomerId: customer.id },
    });
  }

  // Create payment intent
  const amount = Math.round(mission.clientPrice * 100); // Convert to cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    customer: stripeCustomerId,
    metadata: {
      missionId: mission.id,
      clientId: mission.clientId,
      providerId: mission.providerId || '',
    },
    description: `Payment for mission: ${mission.title}`,
  });

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      missionId,
      userId: clientId,
      amount: mission.clientPrice,
      platformFee: mission.platformFee!,
      providerEarning: mission.providerEarning!,
      stripePaymentId: paymentIntent.id,
      stripePaymentIntent: paymentIntent.client_secret || '',
      status: 'PENDING',
    },
  });

  return {
    paymentIntent: paymentIntent.client_secret,
    payment,
  };
};

/**
 * Confirm payment and transfer to provider
 */
export const confirmPayment = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      mission: {
        include: {
          provider: true,
          client: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status === 'COMPLETED') {
    throw new AppError('Payment already completed', 400);
  }

  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(
    payment.stripePaymentId!
  );

  if (paymentIntent.status !== 'succeeded') {
    throw new AppError('Payment not succeeded', 400);
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'COMPLETED' },
  });

  // Update provider balance
  if (payment.mission.providerId) {
    await prisma.user.update({
      where: { id: payment.mission.providerId },
      data: {
        balance: {
          increment: payment.providerEarning,
        },
      },
    });

    // Notify provider
    if (payment.mission.provider?.fcmToken) {
      await sendPushNotification(payment.mission.provider.fcmToken, {
        title: 'Paiement reçu',
        body: `Vous avez reçu ${payment.providerEarning}€`,
        data: {
          missionId: payment.missionId,
          type: 'PAYMENT_RECEIVED',
        },
      });
    }
  }

  return payment;
};

/**
 * Get payment by mission ID
 */
export const getPaymentByMissionId = async (
  missionId: string,
  userId: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { missionId },
    include: {
      mission: {
        include: {
          client: true,
          provider: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Check access
  if (
    payment.mission.clientId !== userId &&
    payment.mission.providerId !== userId
  ) {
    throw new AppError('Access denied', 403);
  }

  return payment;
};

/**
 * Get user payment history
 */
export const getUserPaymentHistory = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: { userId },
    include: {
      mission: {
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return payments;
};

/**
 * Get provider earnings
 */
export const getProviderEarnings = async (providerId: string) => {
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
  });

  if (!provider || provider.role !== 'PROVIDER') {
    throw new AppError('Only providers can view earnings', 403);
  }

  // Get completed missions
  const missions = await prisma.mission.findMany({
    where: {
      providerId,
      status: 'COMPLETED',
    },
    include: {
      payment: true,
    },
  });

  const totalEarnings = missions.reduce(
    (sum, mission) => sum + (mission.providerEarning || 0),
    0
  );

  const paidEarnings = missions
    .filter((m) => m.payment?.status === 'COMPLETED')
    .reduce((sum, mission) => sum + (mission.providerEarning || 0), 0);

  const pendingEarnings = totalEarnings - paidEarnings;

  return {
    totalEarnings,
    paidEarnings,
    pendingEarnings,
    currentBalance: provider.balance,
    completedMissions: missions.length,
  };
};

/**
 * Request payout to bank account (for providers)
 */
export const requestPayout = async (
  providerId: string,
  amount: number
) => {
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
  });

  if (!provider || provider.role !== 'PROVIDER') {
    throw new AppError('Only providers can request payouts', 403);
  }

  if (provider.balance < amount) {
    throw new AppError('Insufficient balance', 400);
  }

  if (amount < 10) {
    throw new AppError('Minimum payout amount is 10€', 400);
  }

  // In production, you would create a Stripe transfer or payout here
  // For now, we'll just update the balance
  await prisma.user.update({
    where: { id: providerId },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  return {
    success: true,
    message: 'Payout requested successfully',
    amount,
  };
};

/**
 * Handle Stripe webhook events
 */
export const handleStripeWebhook = async (event: any) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (paymentIntent: any) => {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
    include: {
      mission: {
        include: {
          provider: true,
        },
      },
    },
  });

  if (payment && payment.status === 'PENDING') {
    await confirmPayment(payment.id);
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (paymentIntent: any) => {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
  }
};
