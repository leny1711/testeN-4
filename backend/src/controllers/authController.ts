/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Register validation rules
 */
export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role')
    .isIn(['CLIENT', 'PROVIDER'])
    .withMessage('Role must be CLIENT or PROVIDER'),
];

/**
 * Login validation rules
 */
export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password, firstName, lastName, phone, role } = req.body;

  const result = await authService.registerUser({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await authService.getUserProfile(userId);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const {
      firstName,
      lastName,
      phone,
      profilePicture,
      address,
      city,
      country,
      vehicleType,
      serviceRadius,
    } = req.body;

    const user = await authService.updateUserProfile(userId, {
      firstName,
      lastName,
      phone,
      profilePicture,
      address,
      city,
      country,
      vehicleType,
      serviceRadius,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  }
);

/**
 * Update user location
 */
export const updateLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const result = await authService.updateUserLocation(
      userId,
      parseFloat(latitude),
      parseFloat(longitude)
    );

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: result,
    });
  }
);

/**
 * Update provider availability
 */
export const updateAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isAvailable must be a boolean',
      });
    }

    const result = await authService.updateProviderAvailability(
      userId,
      isAvailable
    );

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: result,
    });
  }
);

/**
 * Update FCM token
 */
export const updateFcmToken = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    const result = await authService.updateFcmToken(userId, fcmToken);

    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully',
      data: result,
    });
  }
);
