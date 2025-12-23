/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  phone?: string;
  profilePicture?: string;
  averageRating?: number;
  isAvailable?: boolean;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { token, user: userData } = response.data.data;

      // Save to storage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erreur lors de la connexion';
      throw new Error(message);
    }
  };

  const signUp = async (data: any) => {
    try {
      const response = await authApi.register(data);
      const { token, user: userData } = response.data.data;

      // Save to storage
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erreur lors de l'inscription";
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
