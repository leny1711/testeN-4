/**
 * Mission Service
 * Handles all mission-related business logic
 */

import prisma from '../config/database';
import { MissionStatus, MissionUrgency, UserRole } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { calculateFees } from '../config/stripe';
import { sendPushNotification } from '../config/firebase';

/**
 * Calculate distance between two points in kilometers (Haversine formula)
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Create a new mission
 */
export const createMission = async (
  clientId: string,
  data: {
    title: string;
    description: string;
    category: string;
    pickupAddress: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    deliveryAddress?: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    urgency: MissionUrgency;
    clientPrice: number;
    estimatedDuration?: number;
    notes?: string;
  }
) => {
  // Validate client
  const client = await prisma.user.findUnique({
    where: { id: clientId },
  });

  if (!client || client.role !== 'CLIENT') {
    throw new AppError('Only clients can create missions', 403);
  }

  // Calculate fees
  const { platformFee, providerEarning } = calculateFees(data.clientPrice);

  // Create mission
  const mission = await prisma.mission.create({
    data: {
      clientId,
      title: data.title,
      description: data.description,
      category: data.category,
      pickupAddress: data.pickupAddress,
      pickupLatitude: data.pickupLatitude,
      pickupLongitude: data.pickupLongitude,
      deliveryAddress: data.deliveryAddress,
      deliveryLatitude: data.deliveryLatitude,
      deliveryLongitude: data.deliveryLongitude,
      urgency: data.urgency,
      clientPrice: data.clientPrice,
      platformFee,
      providerEarning,
      estimatedDuration: data.estimatedDuration,
      notes: data.notes,
      status: 'PENDING',
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          averageRating: true,
        },
      },
    },
  });

  // Notify nearby available providers
  await notifyNearbyProviders(mission);

  return mission;
};

/**
 * Get missions for a user (client or provider)
 */
export const getUserMissions = async (
  userId: string,
  role: UserRole,
  status?: MissionStatus
) => {
  const where: any = status ? { status } : {};

  if (role === 'CLIENT') {
    where.clientId = userId;
  } else if (role === 'PROVIDER') {
    where.providerId = userId;
  }

  const missions = await prisma.mission.findMany({
    where,
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          phone: true,
        },
      },
      provider: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          phone: true,
          averageRating: true,
        },
      },
      rating: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return missions;
};

/**
 * Get nearby available missions for provider
 */
export const getNearbyMissions = async (
  providerId: string,
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) => {
  // Get provider
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
  });

  if (!provider || provider.role !== 'PROVIDER') {
    throw new AppError('Only providers can view nearby missions', 403);
  }

  // Get all pending missions
  const missions = await prisma.mission.findMany({
    where: {
      status: 'PENDING',
      pickupLatitude: { not: null },
      pickupLongitude: { not: null },
    },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          averageRating: true,
        },
      },
    },
  });

  // Filter by distance
  const nearbyMissions = missions
    .filter((mission) => {
      if (!mission.pickupLatitude || !mission.pickupLongitude) return false;
      const distance = calculateDistance(
        latitude,
        longitude,
        mission.pickupLatitude,
        mission.pickupLongitude
      );
      return distance <= radiusKm;
    })
    .map((mission) => ({
      ...mission,
      distance: calculateDistance(
        latitude,
        longitude,
        mission.pickupLatitude!,
        mission.pickupLongitude!
      ),
    }))
    .sort((a, b) => a.distance - b.distance);

  return nearbyMissions;
};

/**
 * Get mission by ID
 */
export const getMissionById = async (missionId: string, userId: string) => {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      client: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          phone: true,
          averageRating: true,
        },
      },
      provider: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          phone: true,
          averageRating: true,
          currentLatitude: true,
          currentLongitude: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
      rating: true,
      payment: true,
    },
  });

  if (!mission) {
    throw new AppError('Mission not found', 404);
  }

  // Check if user has access to this mission
  if (
    mission.clientId !== userId &&
    mission.providerId !== userId &&
    (await isAdmin(userId)) === false
  ) {
    throw new AppError('Access denied', 403);
  }

  return mission;
};

/**
 * Accept a mission (provider)
 */
export const acceptMission = async (missionId: string, providerId: string) => {
  // Validate provider
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
  });

  if (!provider || provider.role !== 'PROVIDER') {
    throw new AppError('Only providers can accept missions', 403);
  }

  // Get mission
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { client: true },
  });

  if (!mission) {
    throw new AppError('Mission not found', 404);
  }

  if (mission.status !== 'PENDING') {
    throw new AppError('Mission is not available', 400);
  }

  // Update mission
  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    data: {
      providerId,
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
    include: {
      client: true,
      provider: true,
    },
  });

  // Notify client
  if (mission.client.fcmToken) {
    await sendPushNotification(mission.client.fcmToken, {
      title: 'Mission acceptée',
      body: `${provider.firstName} a accepté votre mission`,
      data: { missionId, type: 'MISSION_ACCEPTED' },
    });
  }

  // Create notification
  await prisma.notification.create({
    data: {
      userId: mission.clientId,
      type: 'MISSION_ACCEPTED',
      title: 'Mission acceptée',
      body: `${provider.firstName} a accepté votre mission`,
      data: JSON.stringify({ missionId }),
    },
  });

  return updatedMission;
};

/**
 * Start a mission (provider)
 */
export const startMission = async (missionId: string, providerId: string) => {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { client: true },
  });

  if (!mission) {
    throw new AppError('Mission not found', 404);
  }

  if (mission.providerId !== providerId) {
    throw new AppError('Access denied', 403);
  }

  if (mission.status !== 'ACCEPTED') {
    throw new AppError('Mission must be accepted first', 400);
  }

  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
  });

  // Notify client
  if (mission.client.fcmToken) {
    await sendPushNotification(mission.client.fcmToken, {
      title: 'Mission démarrée',
      body: 'Votre mission a commencé',
      data: { missionId, type: 'MISSION_STARTED' },
    });
  }

  return updatedMission;
};

/**
 * Complete a mission (provider)
 */
export const completeMission = async (
  missionId: string,
  providerId: string
) => {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { client: true },
  });

  if (!mission) {
    throw new AppError('Mission not found', 404);
  }

  if (mission.providerId !== providerId) {
    throw new AppError('Access denied', 403);
  }

  if (mission.status !== 'IN_PROGRESS') {
    throw new AppError('Mission must be in progress', 400);
  }

  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // Notify client
  if (mission.client.fcmToken) {
    await sendPushNotification(mission.client.fcmToken, {
      title: 'Mission terminée',
      body: 'Votre mission est terminée',
      data: { missionId, type: 'MISSION_COMPLETED' },
    });
  }

  return updatedMission;
};

/**
 * Cancel a mission
 */
export const cancelMission = async (missionId: string, userId: string) => {
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: { client: true, provider: true },
  });

  if (!mission) {
    throw new AppError('Mission not found', 404);
  }

  // Check permissions
  if (mission.clientId !== userId && mission.providerId !== userId) {
    throw new AppError('Access denied', 403);
  }

  // Cannot cancel completed missions
  if (mission.status === 'COMPLETED') {
    throw new AppError('Cannot cancel completed missions', 400);
  }

  const updatedMission = await prisma.mission.update({
    where: { id: missionId },
    data: { status: 'CANCELLED' },
  });

  // Notify the other party
  const notifyUserId =
    userId === mission.clientId ? mission.providerId : mission.clientId;
  const notifyUser =
    userId === mission.clientId ? mission.provider : mission.client;

  if (notifyUserId && notifyUser?.fcmToken) {
    await sendPushNotification(notifyUser.fcmToken, {
      title: 'Mission annulée',
      body: 'La mission a été annulée',
      data: { missionId, type: 'MISSION_CANCELLED' },
    });
  }

  return updatedMission;
};

/**
 * Notify nearby providers about new mission
 */
const notifyNearbyProviders = async (mission: any) => {
  if (!mission.pickupLatitude || !mission.pickupLongitude) return;

  // Find available providers within 10km
  const providers = await prisma.user.findMany({
    where: {
      role: 'PROVIDER',
      isAvailable: true,
      status: 'ACTIVE',
      fcmToken: { not: null },
      currentLatitude: { not: null },
      currentLongitude: { not: null },
    },
  });

  const nearbyProviders = providers.filter((provider) => {
    if (!provider.currentLatitude || !provider.currentLongitude) return false;
    const distance = calculateDistance(
      mission.pickupLatitude,
      mission.pickupLongitude,
      provider.currentLatitude,
      provider.currentLongitude
    );
    return distance <= (provider.serviceRadius || 10);
  });

  // Send notifications
  for (const provider of nearbyProviders) {
    if (provider.fcmToken) {
      await sendPushNotification(provider.fcmToken, {
        title: 'Nouvelle mission disponible',
        body: `${mission.title} - ${mission.clientPrice}€`,
        data: { missionId: mission.id, type: 'NEW_MISSION' },
      });

      // Create notification record
      await prisma.notification.create({
        data: {
          userId: provider.id,
          type: 'NEW_MISSION',
          title: 'Nouvelle mission disponible',
          body: `${mission.title} - ${mission.clientPrice}€`,
          data: JSON.stringify({ missionId: mission.id }),
        },
      });
    }
  }
};

/**
 * Check if user is admin
 */
const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user?.role === 'ADMIN';
};
