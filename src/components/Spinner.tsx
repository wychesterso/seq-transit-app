import { ActivityIndicator, View } from "react-native";

export function Spinner() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eee",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}
