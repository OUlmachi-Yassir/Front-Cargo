import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
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
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-2xl font-bold mb-8 text-gray-800">Inscription</Text>

      {!isCompany ? (
        <View className="w-full">
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-xl mb-4 bg-white"
            placeholder="Nom"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-xl mb-4 bg-white"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-xl mb-4 bg-white"
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            className={`w-full p-4 rounded-xl mb-4 items-center ${loading ? 'bg-orange-300' : 'bg-orange-500'}`}
            onPress={() => handleRegister(false)}
            disabled={loading}
          >
            <Text className="text-white font-bold">
              {loading ? 'Inscription en cours...' : 'S`inscrire'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full p-4 rounded-xl mb-4 items-center bg-gray-100"
            onPress={() => setIsCompany(true)}
          >
            <Text className="text-gray-700 font-medium">Vous êtes une entreprise ?</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="w-full">
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-xl mb-4 bg-white"
            placeholder="Nom de l'entreprise"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-xl mb-4 bg-white"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-xl mb-4 bg-white"
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput
            className="w-full p-4 border border-gray-200 rounded-xl mb-4 bg-white"
            placeholder="ICE de l'entreprise"
            value={ice}
            onChangeText={setIce}
          />

          <TouchableOpacity
            className={`w-full p-4 rounded-xl mb-4 items-center ${loading ? 'bg-orange-300' : 'bg-orange-500'}`}
            onPress={() => handleRegister(true)}
            disabled={loading}
          >
            <Text className="text-white font-bold">
              {loading ? 'Inscription en cours...' : 'S`inscrire'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full p-4 rounded-xl mb-4 items-center bg-gray-100"
            onPress={() => setIsCompany(false)}
          >
            <Text className="text-gray-700 font-medium">Vous êtes un particulier ?</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text className="mt-4 text-orange-500 font-medium">Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;