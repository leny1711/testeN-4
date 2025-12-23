/**
 * Rating Controller
 */

import { Request, Response } from 'express';
import * as ratingService from '../services/ratingService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Create a rating
 */
export const createRating = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId, score, comment } = req.body;

    if (!missionId || !score) {
      return res.status(400).json({
        success: false,
        message: 'Mission ID and score are required',
      });
    }

    const rating = await ratingService.createRating(
      userId,
      missionId,
      parseInt(score),
      comment
    );

    res.status(201).json({
      success: true,
      message: 'Rating created successfully',
      data: rating,
    });
  }
);

/**
 * Get user ratings
 */
export const getUserRatings = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const ratings = await ratingService.getUserRatings(userId);

    res.status(200).json({
      success: true,
      data: ratings,
    });
  }
);
