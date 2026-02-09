import { fetchFullServiceInfo } from "@/src/api/services";
import { ErrorState } from "@/src/components/ErrorState";
import { ServiceMap } from "@/src/components/ServiceMap";
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
  const { location } = useLocation();

  const { routeShortName, tripHeadsign, directionId } = useLocalSearchParams<{
    routeShortName: string;
    tripHeadsign: string;
    directionId: string;
  }>();
  const dir = Number(directionId);

  const [service, setService] = useState<FullServiceResponse | null>(null);
  const [focusedStopId, setFocusedStopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listReady, setListReady] = useState(false);

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

  // force a state reset when service is changed
  useEffect(() => {
    setFocusedStopId(null);
    hasScrolledRef.current = false;
  }, [routeShortName, tripHeadsign, dir]);

  // fetch service info on load and when location changes
  useEffect(() => {
    let isMounted = true;

    // first load
    setLoading(true);
    setError(null);

    const controller = new AbortController();

    fetchServiceInfo(controller.signal).finally(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

    // refresh every 15s
    const interval = setInterval(() => {
      fetchServiceInfo(new AbortController().signal);
    }, 15000);

    // cleanup
    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [routeShortName, tripHeadsign, dir, location?.lat, location?.lon]);

  // set focused stop to nearest on load
  useEffect(() => {
    if (!service || nearestIndex < 0) return;

    setFocusedStopId((prev) =>
      prev === null ? service.arrivalsAtStops[nearestIndex].stop.stopId : prev,
    );
  }, [service, nearestIndex]);

  // scroll to the currently focused stop whenever it changes
  useEffect(() => {
    if (!listReady || !focusedStopId) return;

    const index = service?.arrivalsAtStops.findIndex(
      (s) => s.stop.stopId === focusedStopId,
    );

    if (index === undefined || index < 0) return;

    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  }, [focusedStopId, listReady, service]);

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
          <ServiceMap
            stops={service.arrivalsAtStops}
            focusedStopId={focusedStopId}
            onFocusStop={(stopId) => setFocusedStopId(stopId)}
          />
        )}

        {service && (
          <FlatList
            data={service.arrivalsAtStops}
            keyExtractor={(item) => item.stop.stopId}
            ref={listRef}
            style={{ backgroundColor: "#eee" }}
            onLayout={() => setListReady(true)}
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
                expanded={focusedStopId === item.stop.stopId}
                onToggle={() =>
                  setFocusedStopId((prev) =>
                    prev === item.stop.stopId ? null : item.stop.stopId,
                  )
                }
              />
            )}
          />
        )}
      </View>
    </View>
  );
}
