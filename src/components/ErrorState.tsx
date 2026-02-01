import { Button, Text, View } from "react-native";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <Text style={{ marginBottom: 12, textAlign: "center" }}>{message}</Text>
      {onRetry && <Button title="Retry" onPress={onRetry} />}
    </View>
  );
}
