/**
 * Create Mission Screen
 * Client creates a new service request
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { missionApi } from '../../services/api';

const CATEGORIES = [
  { id: 'courses', label: 'Faire des courses' },
  { id: 'colis', label: 'Récupérer un colis' },
  { id: 'promenade', label: 'Promener un chien' },
  { id: 'achat', label: 'Acheter un objet' },
  { id: 'autre', label: 'Autre' },
];

const URGENCY_LEVELS = [
  { id: 'LOW', label: 'Basse' },
  { id: 'MEDIUM', label: 'Moyenne' },
  { id: 'HIGH', label: 'Haute' },
  { id: 'URGENT', label: 'Urgent' },
];

const CreateMissionScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'courses',
    pickupAddress: '',
    deliveryAddress: '',
    urgency: 'MEDIUM',
    clientPrice: '',
    estimatedDuration: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.pickupAddress ||
      !formData.clientPrice
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const price = parseFloat(formData.clientPrice);
    if (isNaN(price) || price < 1) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide (minimum 1€)');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        clientPrice: price,
        estimatedDuration: formData.estimatedDuration
          ? parseInt(formData.estimatedDuration)
          : undefined,
      };

      await missionApi.createMission(dataToSend);
      Alert.alert('Succès', 'Mission créée avec succès', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvelle demande</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Faire mes courses au supermarché"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Décrivez votre demande en détail"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                formData.category === cat.id && styles.categoryButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, category: cat.id })}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  formData.category === cat.id && styles.categoryButtonTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Adresse de départ *</Text>
        <TextInput
          style={styles.input}
          placeholder="Adresse où commencer la mission"
          value={formData.pickupAddress}
          onChangeText={(text) =>
            setFormData({ ...formData, pickupAddress: text })
          }
        />

        <Text style={styles.label}>Adresse de livraison (optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Adresse de destination"
          value={formData.deliveryAddress}
          onChangeText={(text) =>
            setFormData({ ...formData, deliveryAddress: text })
          }
        />

        <Text style={styles.label}>Urgence</Text>
        <View style={styles.urgencyContainer}>
          {URGENCY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.urgencyButton,
                formData.urgency === level.id && styles.urgencyButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, urgency: level.id })}
            >
              <Text
                style={[
                  styles.urgencyButtonText,
                  formData.urgency === level.id && styles.urgencyButtonTextActive,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Prix proposé (€) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Montant à payer"
          value={formData.clientPrice}
          onChangeText={(text) =>
            setFormData({ ...formData, clientPrice: text })
          }
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Durée estimée (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 30"
          value={formData.estimatedDuration}
          onChangeText={(text) =>
            setFormData({ ...formData, estimatedDuration: text })
          }
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Notes supplémentaires</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Informations additionnelles"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createButtonText}>Créer la demande</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  urgencyButtonActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  urgencyButtonText: {
    fontSize: 14,
    color: '#666',
  },
  urgencyButtonTextActive: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CreateMissionScreen;
