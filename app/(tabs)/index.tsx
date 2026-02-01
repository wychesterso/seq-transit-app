import { FlatList, Text, View } from "react-native";

const MOCK_SERVICES = [
  { route: "412", headsign: "St Lucia", arrivalTime: "3 min" },
  { route: "470", headsign: "Toowong", arrivalTime: "7 min" },
];

export default function NearbyServicesScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#800000",
        padding: 16,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 24,
          fontWeight: "600",
        }}
      >
        Nearby Services
      </Text>

      <FlatList
        data={MOCK_SERVICES}
        keyExtractor={(item) => item.route}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 12,
              marginVertical: 8,
              backgroundColor: "#eee",
              borderRadius: 8,
            }}
          >
            <Text>{item.route}</Text>
            <Text>{item.headsign}</Text>
            <Text>{item.arrivalTime}</Text>
          </View>
        )}
      />
    </View>
  );
}
