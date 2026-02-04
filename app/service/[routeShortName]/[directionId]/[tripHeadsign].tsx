import { fetchFullServiceInfo } from "@/src/api/services";
import { ErrorState } from "@/src/components/ErrorState";
import { Header } from "@/src/components/Header";
import { Spinner } from "@/src/components/Spinner";
import { FullServiceResponse } from "@/src/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();

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
      <Header title={`${routeShortName || "—"} ${tripHeadsign || "—"}`} />
      <View
        style={{
          paddingBottom: 8,
          paddingLeft: 12,
          paddingRight: 12,
          backgroundColor: "#ef60a3",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "600" }}>
          {service?.routeLongName || "—"}
        </Text>
      </View>

      <View style={{ backgroundColor: "#eee", flex: 1 }}></View>
    </View>
  );
}
