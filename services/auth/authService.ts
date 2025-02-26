import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import ErrorService from '../error/ErrorService';


export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors de la connexion');

      await AsyncStorage.setItem('token', data.token);
      return data;
    } catch (error) {
        ErrorService.handleError(error);
        throw error;
    }
  },

  register: async (name: string, email: string, password: string, ice:string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password,ice }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors de l’inscription');

      return data;
    } catch (error:unknown) {
        ErrorService.handleError(error);
        throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
  },

  getToken: async () => {
    return await AsyncStorage.getItem('token');
  }
};
