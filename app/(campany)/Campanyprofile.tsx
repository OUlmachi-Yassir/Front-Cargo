import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  TextInput,
  ActivityIndicator,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { getUserProfile, updateUserProfile, updateUserImage, deleteUserProfile, updateUserImage2 } from '~/services/user/profileService';
import { authService } from '~/services/auth/authService';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { replaceIp } from '~/services/helpers/helpers';
import * as ImagePicker from 'expo-image-picker';
import tw from 'twrnc';
import Svg, { Path } from 'react-native-svg';
import MapComponent from '~/components/map/MapComponent';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';

const ComponyProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<any>({});
  const [location, setLocation] = useState<{ latitude: number; longitude: number; city?: string | null; country?: string | null } | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-300)).current; 
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

    const loc =  Location.getCurrentPositionAsync({}).then(({coords : { latitude, longitude }})=> {
      Location.reverseGeocodeAsync({ latitude, longitude }).then((address) => {
        if (address.length > 0) {
          const { city, country } = address[0];
          setLocation({ latitude, longitude, city, country });
        } else {
          setLocation({ latitude, longitude });
        }
      })
    });
   
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
      mediaTypes: ['images'],
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

  const toggleSidebar = () => {
    if (sidebarVisible) {
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(sidebarAnimation, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    <View style={tw`flex-1 relative bg-white` }>
      <TouchableOpacity onPress={toggleSidebar} style={tw`absolute top-10 left-83 z-50`}>
        <View style={[
            tw`w-1 h-0.5 border-4 rounded-full shadow-2xl bg-black mb-1`,
            {
              shadowColor: "#FF6347",
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.6,
              shadowRadius: 5,
              elevation: 5, 
            }
          ]}
        />
        <View style={[
            tw`w-1 h-0.5 border-4 rounded-full shadow-2xl bg-black mb-1`,
            {
              shadowColor: "#FF6347",
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.6,
              shadowRadius: 5,
              elevation: 5,  
            }
          ]} />
        <View style={[
            tw`w-1 h-0.5 border-4 rounded-full shadow-2xl bg-black `,
            {
              shadowColor: "#FF6347",
              shadowOffset: { width: 4, height: 4 },
              shadowOpacity: 0.6,
              shadowRadius: 5,
              elevation: 5, 
            }
          ]} />
      </TouchableOpacity>

      <Animated.View
        style={[
          tw`absolute top-50 left-0 w-64 h-60 rounded-br-lg bg-white p-5 shadow-lg z-50`,
          { transform: [{ translateX: sidebarAnimation }] },
        ]}
      >
      <TouchableOpacity onPress={toggleSidebar} style={tw`py-5  z-50`}>
        <View style={tw`w-6 h-0.5 bg-black mb-1`} />
        <View style={tw`w-6 h-0.5 bg-black mb-1`} />
        <View style={tw`w-6 h-0.5 bg-black`} />
      </TouchableOpacity>
        <TouchableOpacity
          style={tw`py-3 border-b border-gray-200 flex flex-row items-center`}
          onPress={() => {
            setEditing(true);
            toggleSidebar();
          }}
        >
          <Svg
                    viewBox="0 0 24 24"
                    width={24}
                    height={24}
                    style={tw`mr-2`}
                  >
                    <Path
                      d="M14,10V22H4a2,2,0,0,1-2-2V10Z"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                    />
                    <Path
                      d="M22,10V20a2,2,0,0,1-2,2H16V10Z"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                    />
                    <Path
                      d="M22,4V8H2V4A2,2,0,0,1,4,2H20A2,2,0,0,1,22,4Z"
                      fill="none"
                      stroke="#000"
                      strokeWidth="2"
                    />
                  </Svg>
          <Text style={tw`text-lg`}>
            Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`py-3 border-b border-gray-200 flex flex-row items-center`}
          onPress={handleDelete}
        >
          <Svg
                    viewBox="0 0 24 24"
                    width={24}
                    height={24}
                    style={tw`mr-2`}
                  >
                    <Path
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      fill="none"
                      stroke="#000"
                    />
                  </Svg>
          <Text style={tw`text-lg`}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={tw`py-3 border-b border-gray-200 flex flex-row items-center`}
          onPress={handleLogout}
        >
           <Svg
                    fill="none"
                    viewBox="0 0 24 24"
                    width={24}
                    height={24}
                    style={tw`mr-2`}
                  >
                    <Path
                      d="M17.2929 14.2929C16.9024 14.6834 16.9024 15.3166 17.2929 15.7071C17.6834 16.0976 18.3166 16.0976 18.7071 15.7071L21.6201 12.7941C21.6351 12.7791 21.6497 12.7637 21.6637 12.748C21.87 12.5648 22 12.2976 22 12C22 11.7024 21.87 11.4352 21.6637 11.252C21.6497 11.2363 21.6351 11.2209 21.6201 11.2059L18.7071 8.29289C18.3166 7.90237 17.6834 7.90237 17.2929 8.29289C16.9024 8.68342 16.9024 9.31658 17.2929 9.70711L18.5858 11H13C12.4477 11 12 11.4477 12 12C12 12.5523 12.4477 13 13 13H18.5858L17.2929 14.2929Z"
                      fill="#000000"
                    />
                    <Path
                      d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H14.5C15.8807 22 17 20.8807 17 19.5V16.7326C16.8519 16.647 16.7125 16.5409 16.5858 16.4142C15.9314 15.7598 15.8253 14.7649 16.2674 14H13C11.8954 14 11 13.1046 11 12C11 10.8954 11.8954 10 13 10H16.2674C15.8253 9.23514 15.9314 8.24015 16.5858 7.58579C16.7125 7.4591 16.8519 7.35296 17 7.26738V4.5C17 3.11929 15.8807 2 14.5 2H5Z"
                      fill="#000000"
                    />
                  </Svg>
          <Text style={tw`text-lg`}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={tw`items-center `}>
        {user ? (
          <ScrollView style={tw`bg-white w-full`}>
            <TouchableOpacity onPress={handleImagePicker}>
              <Image
                source={user.profileImage ? { uri: replaceIp(user.profileImage, process.env.EXPO_PUBLIC_URL) } : require('~/assets/images/blank-profile-picture-973460_1280.png')}
                style={tw`w-full h-50 relative top-5 `}
              />
            </TouchableOpacity>
            <Text style={tw`text-2xl font-bold text-center bg-white pt-10 mb-10 rounded-full `}>
              Hi WHATS NEW <Text style={tw`text-2xl uppercase text-red-500`}>{user.name}</Text>
            </Text>

            {editing ? (
              <>
                <TextInput
                  style={tw`border p-2 rounded-md mb-2`}
                  placeholder="Name"
                  value={updatedUser.name}
                  onChangeText={(text) => setUpdatedUser({ ...updatedUser, name: text })}
                />
                <TextInput
                  style={tw`border p-2 rounded-md mb-2`}
                  placeholder="Email"
                  value={updatedUser.email}
                  editable={false}
                />
                {user.role === 'company' && (
                  <TextInput
                    style={tw`border p-2 rounded-md mb-2`}
                    placeholder="ICE"
                    value={updatedUser.ice || ''}
                    onChangeText={(text) => setUpdatedUser({ ...updatedUser, ice: text })}
                  />
                )}
                {location && (
                  <Text style={tw`border p-2 rounded-md mb-2`}>
                    Location: {location.city}, {location.country} (Lat: {location.latitude}, Long: {location.longitude})
                  </Text>
                )}
                <Button title="Save Changes" onPress={handleUpdate} />
                <Button title="Cancel" onPress={() => setEditing(false)} color="gray" />
              </>
            ) : (
              <>
              <View className='flex flex-col px-5 '>
              <View style={tw``}>
                    <Text style={tw`relative top-2  px-1 z-5 bg-white`}>EMAIL:</Text>
                    <Text style={tw`text-lg mb-5  font-bold rounded-tr-full w-[100%] px-5 py-3 border-2`}>
                      {user.email}
                    </Text>
                  </View>                  
                  {user.role === 'company' && user.ice && (
                      <View style={tw``}>
                        <Text style={tw`relative top-2 px-1 z-5 bg-white`}>ICE:</Text>
                        <Text style={tw`text-lg mb-5 font-bold rounded-tr-full w-[100%] px-5 py-3 border-2`}>
                          {user.ice}
                        </Text>
                      </View>
                    )}
                  <View style={tw` `}><Text style={tw`relative top-2 px-1 z-5 bg-white`}>Profession:</Text><Text style={tw`text-lg mb-5 font-bold rounded-tr-full w-[100%] px-5  py-3 border-2`}>{user.role}</Text></View>
                {location && (
                  <View>
                    <Text  style={tw`relative top-2 px-1 z-5 bg-white`}>Location</Text>
                  <View style={tw`text-lg mb-5 font-bold rounded-tr-full w-[100%] px-5  py-3 border-2 flex flex-row `}>
                    
                    <Svg width={30} height={30} viewBox="0 0 24 24" fill="black">
                      <Path
                        d="M12 2C8.13 2 5 5.13 5 9c0 4.68 6 11 6 11s6-6.32 6-11c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"
                      />
                    </Svg>
                    <Text style={tw`text-xl`}>
                      {location.city}, {location.country} 
                    </Text>
                  </View>
                  </View>
                )}
                  </View>
                    {location && (
                      <View style={tw`w-full h-64 my-4 rounded-full`}>
                        <MapComponent latitude={location.latitude} longitude={location.longitude} />
                      </View>
                    )}
               
              </>
            )}
          </ScrollView>
        ) : (
          <Text>Failed to load profile</Text>
        )}
      </View>
    </View>
  );
};

export default ComponyProfile;