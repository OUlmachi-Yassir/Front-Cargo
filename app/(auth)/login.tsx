import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '~/services/auth/authService';
import ErrorService from '~/services/error/ErrorService';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const rooter = useRouter();
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
      const userData = await authService.login(email, password);
      const role = await authService.getRole();
      console.log(role);
     
      Alert.alert('Succès', 'Connexion réussie !');

      if (role === 'user') {
        rooter.push("/(client)/Clienthome");
      } else if (role === 'company') {
        rooter.push("/(campany)/Home");
      } else {
        Alert.alert('Erreur', 'Rôle inconnu, contactez l\'administrateur.');
      }
      
    } catch (error: unknown) {
      ErrorService.handleError(error);
      Alert.alert('Erreur', 'Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const check = async() => {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');
      if (token) {
        if (role === 'user') {
          rooter.push("/(client)/Clienthome");
        } else if (role === 'company') {
          rooter.push("/(campany)/Home");
        } else {
          Alert.alert('Erreur', 'Rôle inconnu, contactez l\'administrateur.');
        }
      }
    }
    check();
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-1 justify-center px-6`}>
        <View style={tw`mb-10`}>
          <Text style={tw`text-3xl font-bold text-orange-600 text-center`}>Bienvenue</Text>
          <Text style={tw`text-gray-500 text-center mt-2`}>Connectez-vous à votre compte</Text>
        </View>
        
        <View style={tw`mb-6`}>
          <View style={tw`mb-4`}>
            <Text style={tw`text-gray-700 font-medium mb-2 ml-1`}>Email</Text>
            <View style={tw`flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-3 py-2`}>
              <Ionicons name="mail-outline" size={20} color="#f97316" />
              <TextInput
                style={tw`flex-1 ml-2 text-gray-800 h-12`}
                placeholder="Entrez votre email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>
          </View>
          
          <View style={tw`mb-6`}>
            <Text style={tw`text-gray-700 font-medium mb-2 ml-1`}>Mot de passe</Text>
            <View style={tw`flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-3 py-2`}>
              <Ionicons name="lock-closed-outline" size={20} color="#f97316" />
              <TextInput
                style={tw`flex-1 ml-2 text-gray-800 h-12`}
                placeholder="Entrez votre mot de passe"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>
          
          <TouchableOpacity style={tw`self-end mb-6`}>
            <Text style={tw`text-orange-600 font-medium`}>Mot de passe oublié ?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={tw`bg-orange-500 py-4 rounded-xl shadow-md ${loading ? 'opacity-70' : ''}`}
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={tw`text-white text-center font-bold text-lg`}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={tw`flex-row justify-center mt-6`}>
          <Text style={tw`text-gray-600`}>Vous n'avez pas de compte ? </Text>
          <TouchableOpacity onPress={() => rooter.push('/(auth)/signup')}>
            <Text style={tw`text-orange-600 font-bold`}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
        
        <View style={tw`mt-10`}>
          <Text style={tw`text-gray-500 text-center mb-4`}>Ou connectez-vous avec</Text>
          <View style={tw`flex-row justify-center space-x-4`}>
            <TouchableOpacity style={tw`w-14 h-14 rounded-full bg-gray-100 items-center justify-center border border-gray-200`}>
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={tw`w-14 h-14 rounded-full bg-gray-100 items-center justify-center border border-gray-200`}>
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity style={tw`w-14 h-14 rounded-full bg-gray-100 items-center justify-center border border-gray-200`}>
              <Ionicons name="logo-apple" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}