import { fetchFullServiceInfo } from "@/src/api/services";
import { ErrorState } from "@/src/components/ErrorState";
import { Spinner } from "@/src/components/Spinner";
import { StopCard } from "@/src/components/StopCard";
import { FullServiceResponse } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { routeShortName, tripHeadsign, directionId } = useLocalSearchParams<{
    routeShortName: string;
    tripHeadsign: string;
    directionId: string;
  }>();

  const dir = Number(directionId);

  const [service, setService] = useState<FullServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchFullServiceInfo(routeShortName, tripHeadsign, dir, controller.signal)
      .then(setService)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load service info");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [routeShortName, tripHeadsign, dir]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;
  if (!service) return null;

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: "#ef60a3",
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingLeft: 8, paddingRight: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="#242b4c" />
        </TouchableOpacity>

        <View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#242b4c",
            }}
          >
            {routeShortName || "—"}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#242b4c",
            }}
          >
            to {tripHeadsign || "—"}
          </Text>
        </View>
      </View>
      <View style={{ backgroundColor: "#eee", flex: 1 }}>
        <FlatList
          data={service.arrivalsAtStops}
          style={{ backgroundColor: "#eee" }}
          keyExtractor={(item) => item.stop.stopId}
          renderItem={({ item }) => <StopCard arrival={item} />}
        />
      </View>
    </View>
  );
}
