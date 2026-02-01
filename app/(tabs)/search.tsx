import { Text, View } from "react-native";

export default function SearchServicesScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#800000",
        padding: 16,
      }}
    >
      <Text style={{ color: "white" }}>Search Services</Text>
    </View>
  );
}
