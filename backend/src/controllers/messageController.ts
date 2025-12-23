/**
 * Message Controller
 */

import { Request, Response } from 'express';
import * as messageService from '../services/messageService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Send a message
 */
export const sendMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId, content } = req.body;

    if (!missionId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Mission ID and content are required',
      });
    }

    const message = await messageService.sendMessage(userId, missionId, content);

    res.status(201).json({
      success: true,
      data: message,
    });
  }
);

/**
 * Get mission messages
 */
export const getMissionMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { missionId } = req.params;

    const messages = await messageService.getMissionMessages(missionId, userId);

    res.status(200).json({
      success: true,
      data: messages,
    });
  }
);

/**
 * Get unread message count
 */
export const getUnreadCount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const count = await messageService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count },
    });
  }
);
