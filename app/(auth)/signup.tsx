import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { authService } from '~/services/auth/authService';
import ErrorService from '~/services/error/ErrorService';
import { RegisterData } from '~/types/types';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ice, setIce] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (isCompany: boolean) => {
    if (!name || !email || !password || (isCompany && !ice)) {
      Alert.alert('Erreur', 'Tous les champs requis doivent être remplis.');
      return;
    }

    setLoading(true);
    try {
      const dataToSend: RegisterData = isCompany
        ? { name, email, password, ice }
        : { name, email, password };

      await authService.register(dataToSend);
      Alert.alert('Succès', 'Inscription réussie !');
      router.push('/(auth)/login');
    } catch (error) {
      ErrorService.handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      {!isCompany ? (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => handleRegister(false)}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Inscription en cours...' : 'S’inscrire'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsCompany(true)}
          >
            <Text style={styles.toggleButtonText}>Vous êtes une entreprise ?</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom de l'entreprise"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="ICE de l'entreprise"
            value={ice}
            onChangeText={setIce}
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => handleRegister(true)}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Inscription en cours...' : 'S’inscrire'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsCompany(false)}
          >
            <Text style={styles.toggleButtonText}>Vous êtes un particulier ?</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.loginLink}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  toggleButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor: '#6c757d',
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#28a745',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 15,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;