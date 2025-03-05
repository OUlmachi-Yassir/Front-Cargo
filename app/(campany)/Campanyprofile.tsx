import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Button, Alert, Image, TouchableOpacity } from 'react-native';
import { getUserProfile, updateUserProfile, updateUserImage, deleteUserProfile, updateUserImage2 } from '~/services/user/profileService';
import { authService } from '~/services/auth/authService';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { replaceIp } from '~/services/helpers/helpers';
import * as ImagePicker from 'expo-image-picker';


const ComponyProfile = () => {
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


  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access image library was denied');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
    });
  
    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      console.log('Picked image URI:', localUri);
      
      const fileName = localUri.split('/').pop() || 'default_filename.jpg';  
      const fileType = localUri.split('.').pop();
      
      const response = await fetch(localUri);
      const blob = await response.blob();
      const imageFile = new File([blob], fileName, { type: `image/${fileType}` });
      
      const updatedImage = { profileImage: imageFile };
      
  
      const success = await updateUserImage2(localUri);
      if (success) {
        setUser((prev: any) => ({
          ...prev,
          profileImage: result.assets[0].uri,  
        }));
        Alert.alert(success);
      } else {
        Alert.alert('Error', 'Failed to update profile picture');
      }
    }
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
    <View className="flex-1 justify-center items-center bg-gradient-to-t from-[#22c1c3] to-[#fdbb2d] min-h-screen p-6">
      {user ? (
        <View className="bg-red-300 p-6 rounded-xl shadow-md w-full ">
          <Text className="text-2xl font-bold text-center mb-4">Profile</Text>

          <TouchableOpacity onPress={handleImagePicker}>
          <Image
            source={user.profileImage ? { uri: replaceIp(user.profileImage, process.env.EXPO_PUBLIC_URL) } : require('~/assets/images/blank-profile-picture-973460_1280.png')}
            style={{ width: 100, height: 100, borderRadius: 50, borderColor: "black", alignSelf: 'center' }}
            />
          </TouchableOpacity>

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

export default ComponyProfile;
