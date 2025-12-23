/**
 * Mission Detail Screen
 * Shows detailed information about a mission
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { missionApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MissionDetailScreen = ({ route, navigation }: any) => {
  const { missionId } = route.params;
  const { user } = useAuth();
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMission();
  }, []);

  const loadMission = async () => {
    try {
      const response = await missionApi.getMissionById(missionId);
      setMission(response.data.data);
    } catch (error) {
      Alert.alert('Erreur', 'Mission introuvable');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleStartMission = async () => {
    try {
      await missionApi.startMission(missionId);
      Alert.alert('Succès', 'Mission démarrée');
      loadMission();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur');
    }
  };

  const handleCompleteMission = async () => {
    try {
      await missionApi.completeMission(missionId);
      Alert.alert('Succès', 'Mission terminée');
      loadMission();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur');
    }
  };

  const handleCancelMission = async () => {
    Alert.alert(
      'Annuler la mission',
      'Êtes-vous sûr de vouloir annuler cette mission?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await missionApi.cancelMission(missionId);
              Alert.alert('Succès', 'Mission annulée');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Erreur', error.response?.data?.message || 'Erreur');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!mission) {
    return null;
  }

  const isClient = user?.id === mission.clientId;
  const isProvider = user?.id === mission.providerId;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la mission</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>{mission.title}</Text>
          <Text style={styles.price}>{mission.clientPrice}€</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.text}>{mission.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Adresse de départ</Text>
          <Text style={styles.text}>{mission.pickupAddress}</Text>
        </View>

        {mission.deliveryAddress && (
          <View style={styles.section}>
            <Text style={styles.label}>Adresse de livraison</Text>
            <Text style={styles.text}>{mission.deliveryAddress}</Text>
          </View>
        )}

        {mission.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.text}>{mission.notes}</Text>
          </View>
        )}

        {mission.provider && (
          <View style={styles.section}>
            <Text style={styles.label}>Prestataire</Text>
            <Text style={styles.text}>
              {mission.provider.firstName} {mission.provider.lastName}
            </Text>
            {mission.provider.phone && (
              <Text style={styles.text}>📞 {mission.provider.phone}</Text>
            )}
          </View>
        )}

        {mission.client && isProvider && (
          <View style={styles.section}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.text}>
              {mission.client.firstName} {mission.client.lastName}
            </Text>
            {mission.client.phone && (
              <Text style={styles.text}>📞 {mission.client.phone}</Text>
            )}
          </View>
        )}

        {/* Action buttons */}
        {isProvider && mission.status === 'ACCEPTED' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleStartMission}>
            <Text style={styles.actionButtonText}>Démarrer la mission</Text>
          </TouchableOpacity>
        )}

        {isProvider && mission.status === 'IN_PROGRESS' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteMission}
          >
            <Text style={styles.actionButtonText}>Terminer la mission</Text>
          </TouchableOpacity>
        )}

        {(mission.status === 'PENDING' ||
          mission.status === 'ACCEPTED') && (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelMission}
          >
            <Text style={styles.actionButtonText}>Annuler la mission</Text>
          </TouchableOpacity>
        )}

        {mission.messages && mission.messages.length > 0 && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', { missionId })}
          >
            <Text style={styles.chatButtonText}>💬 Ouvrir le chat</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 16,
    paddingTop: 60,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
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
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#5856D6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MissionDetailScreen;
