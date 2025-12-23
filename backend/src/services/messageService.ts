/**
 * Message Service
 * Handles chat messages between clients and providers
 */

import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { sendPushNotification } from '../config/firebase';

/**
 * Send a message
 */
export const sendMessage = async (
  senderId: string,
  missionId: string,
  content: string
) => {
  // Get mission to validate access and find receiver
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

  // Check if sender is part of this mission
  if (mission.clientId !== senderId && mission.providerId !== senderId) {
    throw new AppError('Access denied', 403);
  }

  // Determine receiver
  const receiverId =
    senderId === mission.clientId ? mission.providerId : mission.clientId;

  if (!receiverId) {
    throw new AppError('Mission has no provider yet', 400);
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      missionId,
      senderId,
      receiverId,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
      },
    },
  });

  // Send push notification to receiver
  const receiver = senderId === mission.clientId ? mission.provider : mission.client;
  
  if (receiver?.fcmToken) {
    await sendPushNotification(receiver.fcmToken, {
      title: `Message de ${message.sender.firstName}`,
      body: content,
      data: { missionId, type: 'NEW_MESSAGE' },
    });
  }

  return message;
};

/**
 * Get messages for a mission
 */
export const getMissionMessages = async (
  missionId: string,
  userId: string
) => {
  // Check if user has access to this mission
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
  });

  if (!mission) {
    throw new AppError('Mission not found', 404);
  }

  if (mission.clientId !== userId && mission.providerId !== userId) {
    throw new AppError('Access denied', 403);
  }

  // Get messages
  const messages = await prisma.message.findMany({
    where: { missionId },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      missionId,
      receiverId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return messages;
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (userId: string) => {
  const count = await prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });

  return count;
};
