import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import  RootStackParamList  from '../../types/types';
import { authService } from '~/services/auth/authService';
import ErrorService from '~/services/error/ErrorService';


export default function Login() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      Alert.alert('Succès', 'Connexion réussie !');
      navigation.navigate('(tabs)'); 
    } catch (error:unknown) {
      ErrorService.handleError(error);
      Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('(auth)/signup')}>
      <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#141414' },  // Fond noir comme Netflix
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#fff' },  // Texte clair
  input: { 
    height: 50, 
    backgroundColor: '#333333',  
    paddingHorizontal: 15, 
    marginVertical: 10, 
    color: '#fff', 
    shadowColor: '#AA0000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3, 
  },
  button: { 
    backgroundColor: '#e50914',  
    paddingVertical: 15, 
    marginTop: 20,
    shadowColor: '#AA0000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.3,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center', fontWeight: 'bold' },
  link: { marginTop: 15, color: '#e50914', textAlign: 'center' },  // Lien en rouge vif
});