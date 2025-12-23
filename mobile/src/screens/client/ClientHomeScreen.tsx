/**
 * Client Home Screen
 * Main screen for clients to create mission requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { missionApi } from '../../services/api';

const ClientHomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    setLoading(true);
    try {
      const response = await missionApi.getUserMissions();
      setMissions(response.data.data);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMissions();
  };

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#FF9500';
      case 'ACCEPTED':
        return '#007AFF';
      case 'IN_PROGRESS':
        return '#5856D6';
      case 'COMPLETED':
        return '#34C759';
      case 'CANCELLED':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getMissionStatusText = (status: string) => {
    const statusMap: any = {
      PENDING: 'En attente',
      ACCEPTED: 'Acceptée',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    };
    return statusMap[status] || status;
  };

  const renderMissionItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.missionCard}
      onPress={() => navigation.navigate('MissionDetail', { missionId: item.id })}
    >
      <View style={styles.missionHeader}>
        <Text style={styles.missionTitle}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getMissionStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getMissionStatusText(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.missionDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.missionFooter}>
        <Text style={styles.missionPrice}>{item.clientPrice}€</Text>
        <Text style={styles.missionCategory}>{item.category}</Text>
      </View>

      {item.provider && (
        <View style={styles.providerInfo}>
          <Text style={styles.providerText}>
            Prestataire: {item.provider.firstName} {item.provider.lastName}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bienvenue, {user?.firstName}!</Text>
        <Text style={styles.headerSubtitle}>
          Demandez un service en un clic
        </Text>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateMission')}
      >
        <Text style={styles.createButtonText}>+ Nouvelle demande</Text>
      </TouchableOpacity>

      <View style={styles.missionsContainer}>
        <Text style={styles.sectionTitle}>Mes demandes</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <FlatList
            data={missions}
            renderItem={renderMissionItem}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.missionsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Aucune demande pour le moment
                </Text>
              </View>
            }
          />
        )}
      </View>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  createButton: {
    backgroundColor: '#34C759',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  missionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  missionsList: {
    paddingBottom: 16,
  },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  missionCategory: {
    fontSize: 14,
    color: '#8E8E93',
  },
  providerInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  providerText: {
    fontSize: 14,
    color: '#666',
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

export default ClientHomeScreen;
