import { authService } from '../auth/authService';
import { jwtDecode } from 'jwt-decode';
import * as FileSystem from 'expo-file-system';

const API_URL = process.env.EXPO_PUBLIC_APP_API_URL;

export const getAllUsers = async ()=>{
  try{
    const token = await authService.getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_URL}/users`,{
      method:'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
   if (!response.ok) throw new Error('Failed to fetch users');

    return await response.json();
  } catch (error) {
    console.error('Error fetching users', error);
    return null;
  }
}

export const getUserProfile = async () => {
  try {
    const token = await authService.getToken();
    if (!token) throw new Error('No token found');

    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken.id;

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch profile');

    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userData: any) => {
  try {
    const token = await authService.getToken();
    if (!token) throw new Error('No token found');

    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken.id;

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error('Failed to update profile');

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

export const updateUserImage = async (file: Blob) => {
  try {
    const token = await authService.getToken();
    if (!token) throw new Error('No token found');

    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken.id;
console.log("from service",file);
    const formData = new FormData();
    
    formData.append('image', file);

    const response = await fetch(`${API_URL}/users/${userId}/image`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    console.log(response);

    if (!response.ok) {
      console.log('Failed to update image:', response.status, await response.text());
      throw new Error('Failed to update profile image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

export const updateUserImage2 =  async (fileUri : string) => {
  const token = await authService.getToken();
  if (!token) throw new Error('No token found');

  const decodedToken: any = jwtDecode(token);
  const userId = decodedToken.id;
  const response = await FileSystem.uploadAsync(`${API_URL}/users/${userId}/image`, fileUri, {
    fieldName: 'image',
    httpMethod: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
  });
  return JSON.stringify(response, null, 4);
}

export const deleteUserProfile = async () => {
  try {
    const token = await authService.getToken();
    if (!token) throw new Error('No token found');

    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken.id;

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to delete profile');

    return true;
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
};
