import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";

export default function TabLayout() {
  useEffect(() => {
    NavigationBar.setPositionAsync("relative");
    NavigationBar.setBackgroundColorAsync("#ef60a3");
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#242b4c",
        tabBarInactiveTintColor: "#242b4c80",

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
      <Tabs.Screen
        name="details"
        options={{ tabBarItemStyle: { display: "none" } }}
      />
    </Tabs>
  );
}
