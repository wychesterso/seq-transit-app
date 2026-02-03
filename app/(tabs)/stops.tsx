import { Header } from "@/src/components/Header";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NearbyStopsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
      }}
    >
      <Header title="Nearby Stops" />
      <View style={{ backgroundColor: "#eee", flex: 7 }}></View>
    </View>
  );
}
