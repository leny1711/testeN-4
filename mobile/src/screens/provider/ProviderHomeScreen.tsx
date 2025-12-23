/**
 * Provider Home Screen
 * Shows available nearby missions for providers
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { missionApi, authApi } from '../../services/api';

const ProviderHomeScreen = ({ navigation }: any) => {
  const { user, updateUser } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);

  useEffect(() => {
    if (isAvailable) {
      loadNearbyMissions();
    }
  }, [isAvailable]);

  const loadNearbyMissions = async () => {
    setLoading(true);
    try {
      // In a real app, you would get actual location
      const response = await missionApi.getNearbyMissions(48.8566, 2.3522, 10);
      setMissions(response.data.data);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (value: boolean) => {
    try {
      await authApi.updateAvailability(value);
      setIsAvailable(value);
      updateUser({ isAvailable: value });
      if (value) {
        loadNearbyMissions();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la disponibilité');
    }
  };

  const handleAcceptMission = async (missionId: string) => {
    try {
      await missionApi.acceptMission(missionId);
      Alert.alert('Succès', 'Mission acceptée!');
      loadNearbyMissions();
      navigation.navigate('MissionDetail', { missionId });
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur');
    }
  };

  const renderMissionItem = ({ item }: any) => (
    <View style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <Text style={styles.missionTitle}>{item.title}</Text>
        <Text style={styles.missionPrice}>{item.clientPrice}€</Text>
      </View>

      <Text style={styles.missionDescription}>{item.description}</Text>

      <View style={styles.missionDetails}>
        <Text style={styles.detailText}>📍 {item.pickupAddress}</Text>
        {item.distance && (
          <Text style={styles.detailText}>🚗 {item.distance.toFixed(1)} km</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptMission(item.id)}
      >
        <Text style={styles.acceptButtonText}>Accepter</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Missions disponibles</Text>
        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityText}>Disponible</Text>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#767577', true: '#34C759' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {!isAvailable ? (
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableText}>
            Activez votre disponibilité pour voir les missions
          </Text>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={missions}
          renderItem={renderMissionItem}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.missionsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune mission disponible à proximité
              </Text>
            </View>
          }
        />
      )}
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
    marginBottom: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 8,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  unavailableText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  missionsList: {
    padding: 16,
  },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  missionPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34C759',
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  missionDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  acceptButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default ProviderHomeScreen;
