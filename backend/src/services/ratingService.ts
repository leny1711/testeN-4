/**
 * Rating Service
 * Handles ratings and reviews
 */

import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

/**
 * Create a rating for a completed mission
 */
export const createRating = async (
  raterId: string,
  missionId: string,
  score: number,
  comment?: string
) => {
  // Validate score
  if (score < 1 || score > 5) {
    throw new AppError('Score must be between 1 and 5', 400);
  }

  // Get mission
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!mission) {
    throw new AppError('Mission not found', 404);
  }

  if (mission.status !== 'COMPLETED') {
    throw new AppError('Can only rate completed missions', 400);
  }

  // Check if user is part of this mission
  if (mission.clientId !== raterId && mission.providerId !== raterId) {
    throw new AppError('Access denied', 403);
  }

  // Check if rating already exists
  const existingRating = await prisma.rating.findUnique({
    where: { missionId },
  });

  if (existingRating) {
    throw new AppError('Mission already rated', 400);
  }

  // Determine who is being rated
  const ratedId = raterId === mission.clientId ? mission.providerId : mission.clientId;

  if (!ratedId) {
    throw new AppError('Cannot rate this mission', 400);
  }

  // Create rating
  const rating = await prisma.rating.create({
    data: {
      missionId,
      raterId,
      ratedId,
      score,
      comment,
    },
  });

  // Update user's average rating
  await updateUserRating(ratedId);

  return rating;
};

/**
 * Get ratings for a user
 */
export const getUserRatings = async (userId: string) => {
  const ratings = await prisma.rating.findMany({
    where: { ratedId: userId },
    include: {
      rater: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
      },
      mission: {
        select: {
          id: true,
          title: true,
          completedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ratings;
};

/**
 * Update user's average rating
 */
const updateUserRating = async (userId: string) => {
  const ratings = await prisma.rating.findMany({
    where: { ratedId: userId },
  });

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
    : 0;

  await prisma.user.update({
    where: { id: userId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings,
    },
  });
};
