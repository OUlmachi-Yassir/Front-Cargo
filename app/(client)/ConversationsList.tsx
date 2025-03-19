import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, Button } from 'react-native';
import { getUserConversations } from '~/services/conversation/conversation';
import { getAllUsers } from '~/services/user/profileService';
import { authService } from '~/services/auth/authService';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'expo-router';
import { replaceIp } from '~/services/helpers/helpers';

type User = {
  _id: string;
  name: string;
  images?: string[];
};

type Message = {
  text: string;
};

type Conversation = {
  _id: string;
  senderId: string;
  receiverId: string;
  messages?: Message[];
  otherUser?: User;
};

type DecodedToken = {
  id: string;
};

export default function ConversationsList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [mappedConversations, setMappedConversations] = useState<Conversation[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const userConversations = await getUserConversations();
      const allUsers = await getAllUsers();
      const token = await authService.getToken();

      if (!token) {
        console.error('No token found');
        return;
      }

      const decodedToken = jwtDecode(token) as DecodedToken;
      const loggedUserId = decodedToken.id;

      if (userConversations?.conversations && allUsers) {
        setConversations(userConversations.conversations);
        setUsers(allUsers);

        const mappedData = userConversations.conversations.map((conv: Conversation) => {
          const otherUserId = conv.senderId === loggedUserId ? conv.receiverId : conv.senderId;
          const otherUser = allUsers.find((user: User) => user._id === otherUserId);

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

  const startChat = (receiverId: string) => {
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

          const lastMessage = item.messages?.[item.messages.length - 1]?.text || "No messages yet";

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
              onPress={() => startChat(item.otherUser!._id)}
              className="shadow-md mb-4"
            >
              <Image
                  source={{ uri: item.otherUser.images?.[0] ? replaceIp(item.otherUser.images[0], process.env.EXPO_PUBLIC_URL) : 'https://placeholder.com/50' }}
                  style={{ width: 50, height: 50, borderRadius: 25, marginRight: 16 }}
                  className="object-cover"
                />
              <View className="flex-1">
                <Text className="text-xl font-medium text-gray-800">{item.otherUser.name}</Text>
                <Text className="text-sm text-gray-500">{lastMessage}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}