import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Button, Alert } from 'react-native';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '~/services/user/profileService';
import { authService } from '~/services/auth/authService';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const profileData = await getUserProfile();
      if (profileData) {
        setUser(profileData);
        setUpdatedUser(profileData);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    const result = await updateUserProfile(updatedUser);
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
  const handeleLogout= async ()=>{
    await authService.logout();
    router.push('/(auth)/login');
  }

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
              <TextInput
                className="border p-2 rounded-md mb-2"
                placeholder="Name"
                value={updatedUser.name}
                onChangeText={(text) => setUpdatedUser({ ...updatedUser, name: text })}
              />
              <TextInput
                className="border p-2 rounded-md mb-2"
                placeholder="Email"
                value={updatedUser.email}
                editable={false} 
              />
              {user.role === 'company' && (
                <TextInput
                  className="border p-2 rounded-md mb-2"
                  placeholder="ICE"
                  value={updatedUser.ice || ''}
                  onChangeText={(text) => setUpdatedUser({ ...updatedUser, ice: text })}
                />
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

              <Button title="Edit Profile" onPress={() => setEditing(true)} />
              <Button title="Delete Account" onPress={handleDelete} color="red" />
              <Button title="Log-Out " onPress={handeleLogout} color="red" />
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
