/**
 * Register Screen
 * New user registration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }: any) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT' as 'CLIENT' | 'PROVIDER',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      await signUp(dataToSend);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Créez votre compte</Text>

          <View style={styles.form}>
            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'CLIENT' && styles.roleButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, role: 'CLIENT' })}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === 'CLIENT' && styles.roleButtonTextActive,
                  ]}
                >
                  Client
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === 'PROVIDER' && styles.roleButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, role: 'PROVIDER' })}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === 'PROVIDER' && styles.roleButtonTextActive,
                  ]}
                >
                  Prestataire
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Prénom *"
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Nom *"
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Mot de passe *"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe *"
              value={formData.confirmPassword}
              onChangeText={(text) =>
                setFormData({ ...formData, confirmPassword: text })
              }
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkText}>
                Déjà un compte ?{' '}
                <Text style={styles.linkTextBold}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default RegisterScreen;
