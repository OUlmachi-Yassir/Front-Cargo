import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Button } from 'react-native';
import { getUserConversations } from '~/services/conversation/conversation';
import { getAllUsers } from '~/services/user/profileService';
import { authService } from '~/services/auth/authService';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';

export default function ConversationsList() {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [mappedConversations, setMappedConversations] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const userConversations = await getUserConversations();
      console.log(userConversations)
      const allUsers = await getAllUsers();
      const token = await authService.getToken();
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const decodedToken = jwtDecode(token);
      const loggedUserId = decodedToken.id;

      console.log("Logged User ID:", loggedUserId);
      console.log("All Users:", allUsers);

      if (userConversations?.conversations && allUsers) {
        setConversations(userConversations.conversations);
        setUsers(allUsers);

        const mappedData = userConversations.conversations.map((conv) => {
          const otherUserId = conv.senderId === loggedUserId ? conv.receiverId : conv.senderId;
          const otherUser = allUsers.find((user) => user._id === otherUserId);
        
          console.log("Conversation:", conv);
          console.log("Looking for user with ID:", otherUserId);
          console.log("Found user:", otherUser || "User not found!");

          return { ...conv, otherUser };
        });

        setMappedConversations(mappedData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startChat = (receiverId) => {
    try {
      router.push({ pathname: '/chats/CampanyChat', params: { id: receiverId } });
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (!mappedConversations.length && !isRefreshing) {
    return <Text className="text-center text-lg text-gray-500">Loading...</Text>;
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-semibold text-gray-800">Conversations</Text>
        <Button title="Refresh" onPress={handleRefresh} disabled={isRefreshing} />
      </View>
      <FlatList
        data={mappedConversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          if (!item.otherUser) return null;
          console.log(item)

          return (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                backgroundColor: '#fff',
              }}
              onPress={() => startChat(item.otherUser._id)}
              className="shadow-md mb-4"
            >
              <Image
                source={{ uri: item.otherUser.images?.[0]}}
                style={{ width: 50, height: 50, borderRadius: 25, marginRight: 16 }}
                className="object-cover"
              />
              <Text className="text-xl font-medium text-gray-800">{item.otherUser.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}