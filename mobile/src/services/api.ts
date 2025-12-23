/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updateLocation: (latitude: number, longitude: number) =>
    api.put('/auth/location', { latitude, longitude }),
  updateAvailability: (isAvailable: boolean) =>
    api.put('/auth/availability', { isAvailable }),
  updateFcmToken: (fcmToken: string) =>
    api.put('/auth/fcm-token', { fcmToken }),
};

// Mission API
export const missionApi = {
  createMission: (data: any) => api.post('/missions', data),
  getUserMissions: (status?: string) =>
    api.get('/missions', { params: { status } }),
  getNearbyMissions: (latitude: number, longitude: number, radius?: number) =>
    api.get('/missions/nearby', {
      params: { latitude, longitude, radius },
    }),
  getMissionById: (missionId: string) => api.get(`/missions/${missionId}`),
  acceptMission: (missionId: string) =>
    api.post(`/missions/${missionId}/accept`),
  startMission: (missionId: string) =>
    api.post(`/missions/${missionId}/start`),
  completeMission: (missionId: string) =>
    api.post(`/missions/${missionId}/complete`),
  cancelMission: (missionId: string) =>
    api.post(`/missions/${missionId}/cancel`),
};

// Payment API
export const paymentApi = {
  createPaymentIntent: (missionId: string) =>
    api.post('/payments/create-intent', { missionId }),
  confirmPayment: (paymentId: string) =>
    api.post(`/payments/${paymentId}/confirm`),
  getPaymentByMissionId: (missionId: string) =>
    api.get(`/payments/mission/${missionId}`),
  getPaymentHistory: () => api.get('/payments/history'),
  getProviderEarnings: () => api.get('/payments/earnings'),
  requestPayout: (amount: number) =>
    api.post('/payments/payout', { amount }),
};

// Message API
export const messageApi = {
  sendMessage: (missionId: string, content: string) =>
    api.post('/messages', { missionId, content }),
  getMissionMessages: (missionId: string) =>
    api.get(`/messages/mission/${missionId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

// Rating API
export const ratingApi = {
  createRating: (missionId: string, score: number, comment?: string) =>
    api.post('/ratings', { missionId, score, comment }),
  getUserRatings: (userId: string) => api.get(`/ratings/user/${userId}`),
};

export default api;
