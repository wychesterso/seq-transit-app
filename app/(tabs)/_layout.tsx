import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#242b4c",
        tabBarInactiveTintColor: "#242b4c93",

        tabBarStyle: {
          backgroundColor: "#ef60a3",
          borderTopWidth: 0,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },

        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Services",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="bus" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stops"
        options={{
          title: "Stops",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="location" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="search" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
