import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Button, Alert } from 'react-native';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '~/services/user/profileService';
import { authService } from '~/services/auth/authService';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<any>({});
  const [location, setLocation] = useState<{ latitude: number; longitude: number; city?: string |null; country?: string|null } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await getUserProfile();
      if (profileData) {
        setUser(profileData);
        setUpdatedUser(profileData);
        
        if (profileData.location) {
          setLocation(profileData.location);
        } else {
          await fetchLocation(); 
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const fetchLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    const address = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (address.length > 0) {
      const { city, country } = address[0];
      setLocation({ latitude, longitude, city, country });
    } else {
      setLocation({ latitude, longitude });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const dataToUpdate = { ...updatedUser, location };
    const result = await updateUserProfile(dataToUpdate);
    if (result) {
      setUser(result);
      setEditing(false);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const success = await deleteUserProfile();
          if (success) {
            await authService.logout();
            router.push('/(auth)/login');
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    await authService.logout();
    router.push('/(auth)/login');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      {user ? (
        <View className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
          <Text className="text-2xl font-bold text-center mb-4">Profile</Text>
          {editing ? (
            <>
              <TextInput className="border p-2 rounded-md mb-2" placeholder="Name" value={updatedUser.name} onChangeText={(text) => setUpdatedUser({ ...updatedUser, name: text })} />
              <TextInput className="border p-2 rounded-md mb-2" placeholder="Email" value={updatedUser.email} editable={false} />
              
              {user.role === 'company' && (
                <TextInput className="border p-2 rounded-md mb-2" placeholder="ICE" value={updatedUser.ice || ''} onChangeText={(text) => setUpdatedUser({ ...updatedUser, ice: text })} />
              )}

              {location && (
                <Text className="border p-2 rounded-md mb-2">
                  Location: {location.city}, {location.country} (Lat: {location.latitude}, Long: {location.longitude})
                </Text>
              )}

              <Button title="Save Changes" onPress={handleUpdate} />
              <Button title="Cancel" onPress={() => setEditing(false)} color="gray" />
            </>
          ) : (
            <>
              <Text className="text-lg mb-2"><Text className="font-bold">Name:</Text> {user.name}</Text>
              <Text className="text-lg mb-2"><Text className="font-bold">Email:</Text> {user.email}</Text>
              <Text className="text-lg mb-2"><Text className="font-bold">Role:</Text> {user.role}</Text>

              {user.role === 'company' && user.ice && (
                <Text className="text-lg mb-2"><Text className="font-bold">ICE:</Text> {user.ice}</Text>
              )}

              {location && (
                <Text className="text-lg mb-2">
                  <Text className="font-bold">Location:</Text> {location.city}, {location.country} (Lat: {location.latitude}, Long: {location.longitude})
                </Text>
              )}

              <Button title="Edit Profile" onPress={() => setEditing(true)} />
              <Button title="Delete Account" onPress={handleDelete} color="red" />
              <Button title="Log-Out" onPress={handleLogout} color="red" />
            </>
          )}
        </View>
      ) : (
        <Text>Failed to load profile</Text>
      )}
    </View>
  );
};

export default ProfileScreen;
