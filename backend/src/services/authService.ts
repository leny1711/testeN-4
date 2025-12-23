/**
 * Authentication Service
 * Handles user registration, login, and JWT token generation
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

/**
 * Register a new user
 */
export const registerUser = async (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}) => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      profilePicture: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = generateToken(user.id, user.email, user.role);

  return { user, token };
};

/**
 * Login user
 */
export const loginUser = async (email: string, password: string) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is active
  if (user.status !== 'ACTIVE') {
    throw new AppError('Account is not active', 403);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update last active
  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() },
  });

  // Generate JWT token
  const token = generateToken(user.id, user.email, user.role);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      status: true,
      profilePicture: true,
      currentLatitude: true,
      currentLongitude: true,
      address: true,
      city: true,
      country: true,
      isAvailable: true,
      vehicleType: true,
      serviceRadius: true,
      averageRating: true,
      totalRatings: true,
      balance: true,
      createdAt: true,
      lastActiveAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profilePicture?: string;
    address?: string;
    city?: string;
    country?: string;
    vehicleType?: string;
    serviceRadius?: number;
  }
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      profilePicture: true,
      address: true,
      city: true,
      country: true,
      vehicleType: true,
      serviceRadius: true,
    },
  });

  return user;
};

/**
 * Update user location
 */
export const updateUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number
) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentLatitude: latitude,
      currentLongitude: longitude,
      lastActiveAt: new Date(),
    },
  });

  return { success: true };
};

/**
 * Update provider availability
 */
export const updateProviderAvailability = async (
  userId: string,
  isAvailable: boolean
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.role !== 'PROVIDER') {
    throw new AppError('Only providers can update availability', 403);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isAvailable },
  });

  return { success: true, isAvailable };
};

/**
 * Update FCM token for push notifications
 */
export const updateFcmToken = async (userId: string, fcmToken: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { fcmToken },
  });

  return { success: true };
};

/**
 * Generate JWT token
 */
const generateToken = (id: string, email: string, role: UserRole): string => {
  const jwtSecret = process.env.JWT_SECRET || 'default-secret';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id, email, role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  } as jwt.SignOptions);
};
