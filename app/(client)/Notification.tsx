import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { io } from 'socket.io-client';
import { authService } from '~/services/auth/authService';
import { jwtDecode } from 'jwt-decode';

const SOCKET_SERVER_URL = 'http://locallhost:3000'; 

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const connectSocket = async () => {
      const token = await authService.getToken();
      if (!token) throw new Error('No token found');
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.id;
      if (!userId) {
        console.error('User ID not found in AsyncStorage');
        return;
      }

      const newSocket = io(SOCKET_SERVER_URL, {
        query: { userId }, 
        transports: ['websocket'],
      });

      newSocket.on('notification', (data: { message: string }) => {
        setNotifications(prev => [data.message, ...prev]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    };

    connectSocket();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text style={styles.notification}>{item}</Text>}
        />
      )}
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  emptyText: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 20 },
  notification: { padding: 10, backgroundColor: '#f0f0f0', marginBottom: 5, borderRadius: 5 },
});
