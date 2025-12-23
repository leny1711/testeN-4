/**
 * Profile Screen
 * User profile management
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', onPress: signOut, style: 'destructive' },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileCard}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.role}>
            {user?.role === 'CLIENT' ? 'Client' : 'Prestataire'}
          </Text>
          {user?.averageRating && user.averageRating > 0 && (
            <Text style={styles.rating}>
              ⭐ {user.averageRating.toFixed(1)} ({user.totalRatings} avis)
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    color: '#FF9500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
