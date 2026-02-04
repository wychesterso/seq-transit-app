import { Tabs } from "expo-router";

export default function DetailsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          borderTopWidth: 0,
          height: 0,
        },
      }}
    ></Tabs>
  );
}
