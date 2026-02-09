import { Tabs } from "expo-router";

export default function DetailsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ef60a3",
        tabBarInactiveTintColor: "#ef60a3",

        tabBarStyle: {
          backgroundColor: "#ef60a3",
          borderTopWidth: 0,
          height: 0,
          opacity: 0,
          display: "none",
        },

        headerShown: false,
      }}
    ></Tabs>
  );
}
