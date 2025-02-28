import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Profile() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };
    fetchUser();
  }, []);

  return (
      <View style={styles.container}>
        <Text style={styles.text}>Profile Page</Text>
        {user ? (
          <>
            <Text style={styles.info}>Name: {user.name}</Text>
            <Text style={styles.info}>Email: {user.email}</Text>
          </>
        ) : (
          <Text style={styles.info}>Loading user info...</Text>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    fontSize: 18,
    color: '#e50914',
    marginTop: 10,
  },
});
