import { Text, View } from "react-native";

export function EmptyState({ text }: { text: string }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text style={{ color: "#666", textAlign: "center" }}>{text}</Text>
    </View>
  );
}
