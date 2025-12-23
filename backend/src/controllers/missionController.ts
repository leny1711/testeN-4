/**
 * Mission Controller
 * Handles HTTP requests for mission operations
 */

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as missionService from '../services/missionService';
import { asyncHandler } from '../middleware/errorHandler';
import { MissionUrgency } from '@prisma/client';

/**
 * Create mission validation
 */
export const createMissionValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('pickupAddress').notEmpty().withMessage('Pickup address is required'),
  body('clientPrice')
    .isFloat({ min: 1 })
    .withMessage('Client price must be at least 1'),
  body('urgency')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Invalid urgency level'),
];

/**
 * Create a new mission
 */
export const createMission = asyncHandler(
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const userId = req.user!.id;
    const mission = await missionService.createMission(userId, req.body);

    res.status(201).json({
      success: true,
      message: 'Mission created successfully',
      data: mission,
    });
  }
);

/**
 * Get user missions
 */
export const getUserMissions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const role = req.user!.role;
    const status = req.query.status as any;

    const missions = await missionService.getUserMissions(userId, role, status);

    res.status(200).json({
      success: true,
      data: missions,
    });
  }
);

/**
 * Get nearby missions (for providers)
 */
export const getNearbyMissions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const missions = await missionService.getNearbyMissions(
      userId,
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      radius ? parseFloat(radius as string) : undefined
    );

    res.status(200).json({
      success: true,
      data: missions,
    });
  }
);

/**
 * Get mission by ID
 */
export const getMissionById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId } = req.params;

    const mission = await missionService.getMissionById(missionId, userId);

    res.status(200).json({
      success: true,
      data: mission,
    });
  }
);

/**
 * Accept a mission
 */
export const acceptMission = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId } = req.params;

    const mission = await missionService.acceptMission(missionId, userId);

    res.status(200).json({
      success: true,
      message: 'Mission accepted successfully',
      data: mission,
    });
  }
);

/**
 * Start a mission
 */
export const startMission = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId } = req.params;

    const mission = await missionService.startMission(missionId, userId);

    res.status(200).json({
      success: true,
      message: 'Mission started successfully',
      data: mission,
    });
  }
);

/**
 * Complete a mission
 */
export const completeMission = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId } = req.params;

    const mission = await missionService.completeMission(missionId, userId);

    res.status(200).json({
      success: true,
      message: 'Mission completed successfully',
      data: mission,
    });
  }
);

/**
 * Cancel a mission
 */
export const cancelMission = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId } = req.params;

    const mission = await missionService.cancelMission(missionId, userId);

    res.status(200).json({
      success: true,
      message: 'Mission cancelled successfully',
      data: mission,
    });
  }
);
