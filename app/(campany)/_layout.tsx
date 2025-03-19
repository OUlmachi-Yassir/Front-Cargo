import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useColorScheme } from "~/hooks/useColorScheme.web";
import BlurTabBarBackground from "~/components/ui/TabBarBackground.ios";
import { HapticTab } from "~/components/HapticTab";
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const colors = {
    light: {
      tint: "#F97316",
      tabBarBackground: "white",
      inactive: "#94A3B8",
    },
    dark: {
      tint: "#FB923C",
      tabBarBackground: "#1E293B",
      inactive: "#64748B",
    },
  };

  const activeColor = isDark ? colors.dark.tint : colors.light.tint;
  const inactiveColor = isDark ? colors.dark.inactive : colors.light.inactive;
  const backgroundColor = isDark ? colors.dark.tabBarBackground : colors.light.tabBarBackground;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: BlurTabBarBackground,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            height: 88,
            paddingBottom: 30,
            borderTopWidth: 0,
            shadowColor: isDark ? "#000" : "#64748B",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 5,
          },
          android: {
            height: 60,
            backgroundColor,
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: -2 },
          },
          default: {
            height: 60,
            backgroundColor,
            borderTopWidth: 0,
          },
        }),
        tabBarLabelStyle: {
          fontWeight: "500",
          fontSize: 12,
          marginTop: -4,
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Campanyprofile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="CarsScreen"
        options={{
          title: "Véhicules",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "car" : "car-outline"} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ConversationsList"
        options={{
          title: "My-Chats",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}