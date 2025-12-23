/**
 * Main Navigation
 * Handles app navigation structure
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Client Screens
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import CreateMissionScreen from '../screens/client/CreateMissionScreen';
import MissionDetailScreen from '../screens/client/MissionDetailScreen';
import ClientHistoryScreen from '../screens/client/ClientHistoryScreen';

// Provider Screens
import ProviderHomeScreen from '../screens/provider/ProviderHomeScreen';
import ProviderMissionsScreen from '../screens/provider/ProviderMissionsScreen';
import ProviderEarningsScreen from '../screens/provider/ProviderEarningsScreen';

// Shared Screens
import ProfileScreen from '../screens/shared/ProfileScreen';
import ChatScreen from '../screens/shared/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Client Tab Navigator
const ClientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Home"
        component={ClientHomeScreen}
        options={{
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="History"
        component={ClientHistoryScreen}
        options={{
          tabBarLabel: 'Historique',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

// Provider Tab Navigator
const ProviderTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
      }}
    >
      <Tab.Screen
        name="Home"
        component={ProviderHomeScreen}
        options={{
          tabBarLabel: 'Missions',
        }}
      />
      <Tab.Screen
        name="MyMissions"
        component={ProviderMissionsScreen}
        options={{
          tabBarLabel: 'Mes missions',
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={ProviderEarningsScreen}
        options={{
          tabBarLabel: 'Gains',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user.role === 'CLIENT' ? (
            <>
              <Stack.Screen name="ClientTabs" component={ClientTabs} />
              <Stack.Screen name="CreateMission" component={CreateMissionScreen} />
            </>
          ) : (
            <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
          )}
          <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
