import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { authService } from '~/services/auth/authService';
import ErrorService from '~/services/error/ErrorService';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ice, setIce] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || (isCompany && !ice)) {
      Alert.alert('Erreur', 'Tous les champs requis doivent être remplis.');
      return;
    }

    setLoading(true);
    try {
      await authService.register(name, email, password, isCompany ? ice : String(ice));
      Alert.alert('Succès', 'Inscription réussie !');
      navigation.navigate('(auth)/login');
    } catch (error) {
      ErrorService.handleError(error);
      throw error;
        } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-5">
      <Text className="text-2xl font-bold mb-5">Inscription</Text>

      <TextInput
        className="w-full p-3 border border-gray-300 rounded mb-3"
        placeholder="Nom"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="w-full p-3 border border-gray-300 rounded mb-3"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="w-full p-3 border border-gray-300 rounded mb-3"
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Bouton pour sélectionner Client ou Entreprise */}
      <TouchableOpacity
        className={`w-full p-3 rounded ${isCompany ? 'bg-blue-500' : 'bg-gray-300'}`}
        onPress={() => setIsCompany(!isCompany)}
      >
        <Text className="text-white text-center font-bold">
          {isCompany ? 'Entreprise sélectionnée' : 'Client sélectionné'}
        </Text>
      </TouchableOpacity>

      {/* Champ ICE (Visible uniquement pour une entreprise) */}
      {isCompany && (
        <TextInput
          className="w-full p-3 border border-gray-300 rounded mt-3"
          placeholder="ICE de l'entreprise"
          value={ice}
          onChangeText={setIce}
        />
      )}

      <TouchableOpacity
        className="bg-green-500 w-full p-3 rounded mt-3"
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">{loading ? 'Inscription...' : 'S’inscrire'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('(auth)/login')} className="mt-3">
        <Text className="text-blue-500">Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;
