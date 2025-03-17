import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import io from 'socket.io-client';
import { RouteProp } from '@react-navigation/native';
import RootStackParamList from '~/types/types';
import { useLocalSearchParams } from 'expo-router';
import { authService } from '~/services/auth/authService';
import { jwtDecode } from 'jwt-decode';

const socket = io(`${process.env.EXPO_PUBLIC_APP_API_URL}`);

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface Props {
  route: ChatScreenRouteProp;
}

const ChatScreen: React.FC<Props> = () => {
  const { id: receiverId } = useLocalSearchParams<{ id: string }>();  
  const [messages, setMessages] = useState<{ sender: string; receiverId: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = await authService.getToken();
      if (!token) throw new Error('No token found');
  
      const decodedToken: any = jwtDecode(token);
      setLoggedUserId(decodedToken.id);
      const loggedUser = decodedToken.id;
  
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/conversations/${loggedUser}/${receiverId}`);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
  
        const textResponse = await response.text();
        if (textResponse.trim() === '') {
          console.log('No messages found');
          setMessages([]);
          return;
        }
  
        const data = JSON.parse(textResponse);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
  
    fetchMessages();
  
    socket.emit('joinRoom', { senderId: loggedUserId, receiverId });
  
    const handleMessage = (newMessage: { senderId: string; receiverId: string; text: string }) => {
      if (
        (newMessage.senderId === loggedUserId && newMessage.receiverId === receiverId) ||
        (newMessage.senderId === receiverId && newMessage.receiverId === loggedUserId)
      ) {
        setMessages((prevMessages) => [...prevMessages, { sender: newMessage.senderId, receiverId: newMessage.receiverId, text: newMessage.text }]);
      }
    };
  
    socket.on('receiveMessage', handleMessage);
  
    return () => {
      socket.off('receiveMessage', handleMessage);
      socket.emit('leaveRoom', { senderId: loggedUserId, receiverId });
    };
  }, [receiverId, loggedUserId]);
  

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      console.log('Message is empty, not sending.');
      return;
    }
  
    const token = await authService.getToken();
    if (!token) throw new Error('No token found');
  
    const decodedToken: any = jwtDecode(token);
    const loggedUser = decodedToken.id;
  
    const messageData = {
      senderId: loggedUser,
      receiverId,
      text: newMessage,
    };
  
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_APP_API_URL}/conversations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
  
      if (!response.ok) throw new Error('Failed to send message');
  
      setMessages((prevMessages) => [...prevMessages, { sender: loggedUser, receiverId, text: newMessage }]);
  
      socket.emit('sendMessage', messageData);
  
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View key={index} style={msg.sender === loggedUserId ? styles.userMessage : styles.otherMessage}>
            <Text style={styles.messageText}>{msg.text}</Text>

          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Write a message"
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
});

export default ChatScreen;
