/**
 * Stripe Configuration
 * Payment processing setup
 */

import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Platform commission percentage (default 15%)
export const PLATFORM_COMMISSION = parseFloat(
  process.env.PLATFORM_COMMISSION_PERCENT || '15'
);

/**
 * Calculate platform fee and provider earning from total amount
 */
export const calculateFees = (totalAmount: number) => {
  const platformFee = (totalAmount * PLATFORM_COMMISSION) / 100;
  const providerEarning = totalAmount - platformFee;
  
  return {
    platformFee: Math.round(platformFee * 100) / 100,
    providerEarning: Math.round(providerEarning * 100) / 100,
  };
};

export default stripe;
