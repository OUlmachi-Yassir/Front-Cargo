import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '~/hooks/useColorScheme.web';
import BlurTabBarBackground from '~/components/ui/TabBarBackground.ios';
import { HapticTab } from '~/components/HapticTab';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const orangeColors = {
    active: '#F97316', 
    inactive: '#FB923C',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: orangeColors.active, 
        tabBarInactiveTintColor: orangeColors.inactive, 
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: BlurTabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="Clienthome"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={28}
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={28}
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ConversationsList"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              size={28}
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}