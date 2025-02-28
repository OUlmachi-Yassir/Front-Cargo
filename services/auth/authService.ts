import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import ErrorService from '../error/ErrorService';
import { jwtDecode } from 'jwt-decode';


export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("this is :",data);
      if (!response.ok) throw new Error(data.message || 'Erreur lors de la connexion');

      await AsyncStorage.setItem('token', data.token);
      const decodedToken: any = jwtDecode(data.token);
      console.log("decoded token :", decodedToken);
      if (decodedToken?.role) {
        await AsyncStorage.setItem('role', decodedToken.role);
      } else {
        console.warn("Le rôle est indéfini dans le token.");
      }

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

  getToken: async () => {
    return await AsyncStorage.getItem('token');
  },

  getRole: async () => {
    return await AsyncStorage.getItem('role');
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
  }
};
