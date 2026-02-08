import { fetchFullServiceInfo } from "@/src/api/services";
import { ErrorState } from "@/src/components/ErrorState";
import { Spinner } from "@/src/components/Spinner";
import { StopCard } from "@/src/components/StopCard";
import { useLocation } from "@/src/hooks/useLocation";
import { FullServiceResponse } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { location, loading: locLoading, error: locError } = useLocation();

  const { routeShortName, tripHeadsign, directionId } = useLocalSearchParams<{
    routeShortName: string;
    tripHeadsign: string;
    directionId: string;
  }>();
  const dir = Number(directionId);

  const [service, setService] = useState<FullServiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<FlatList>(null);
  const hasScrolledRef = useRef(false);

  const nearestIndex = useMemo(() => {
    if (!service?.adjacentStop) return -1;

    return service.arrivalsAtStops.findIndex(
      (s) => s.stop.stopId === service.adjacentStop.stopId,
    );
  }, [service]);

  const fetchServiceInfo = (signal?: AbortSignal) => {
    if (!location) return Promise.resolve();

    return fetchFullServiceInfo(
      routeShortName,
      tripHeadsign,
      dir,
      location.lat,
      location.lon,
      signal,
    )
      .then(setService)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load service info");
        }
      });
  };

  useEffect(() => {
    setService(null);

    let isMounted = true;
    const runFetch = () => {
      const controller = new AbortController();

      fetchServiceInfo(controller.signal);

      return controller;
    };

    let controller = runFetch();

    // first load
    setLoading(true);
    setError(null);

    fetchServiceInfo(controller.signal).finally(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    // refresh every 15s
    const interval = setInterval(() => {
      controller = runFetch();
    }, 15000);

    // cleanup
    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [routeShortName, tripHeadsign, dir, location?.lat, location?.lon]);

  useEffect(() => {
    if (!hasScrolledRef.current && nearestIndex >= 0) {
      hasScrolledRef.current = true;

      const timeout = setTimeout(() => {
        listRef.current?.scrollToIndex({
          index: nearestIndex,
          animated: true,
          viewPosition: 0.3,
        });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [nearestIndex]);

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
        {loading && <Spinner />}
        {error && <ErrorState message={error} />}
        {!loading && !service && (
          <ErrorState message="No service data available" />
        )}

        {service && (
          <FlatList
            data={service.arrivalsAtStops}
            style={{ backgroundColor: "#eee" }}
            keyExtractor={(item) => item.stop.stopId}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                });
              }, 300);
            }}
            renderItem={({ item, index }) => (
              <StopCard
                arrival={item}
                defaultExpanded={index === nearestIndex}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}
