import { authService } from '../auth/authService';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.EXPO_PUBLIC_APP_API_URL;

export const getUserConversations = async () => {
  try {
    const token = await authService.getToken();
    if (!token) throw new Error('No token found');

    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken.id;

    const response = await fetch(`${API_URL}/conversations/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response.ok)

    if (!response.ok) throw new Error('Failed to fetch conversations');

    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};
