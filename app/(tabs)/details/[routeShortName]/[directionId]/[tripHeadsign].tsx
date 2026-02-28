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
import {
  AppState,
  AppStateStatus,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { location } = useLocation();

  const {
    routeShortName = "",
    tripHeadsign = "",
    directionId = "0",
  } = useLocalSearchParams<{
    routeShortName: string;
    tripHeadsign: string;
    directionId: string;
  }>() ?? {};
  const dir = Number(directionId);

  const [service, setService] = useState<FullServiceResponse | null>(null);
  const [focusedStopId, setFocusedStopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef<FlatList>(null);
  const appState = useRef(AppState.currentState);
  const fetchControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* -------------------- FETCH SERVICE -------------------- */

  const hasSetInitialFocusRef = useRef(false);

  const fetchService = async (signal?: AbortSignal) => {
    if (!location) return;
    fetchControllerRef.current?.abort();
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    setError(null);
    try {
      const data = await fetchFullServiceInfo(
        routeShortName,
        tripHeadsign,
        dir,
        location.lat,
        location.lon,
        signal ?? controller.signal,
      );
      setService(data);

      // only auto-focus nearest stop on first load
      if (!hasSetInitialFocusRef.current && data.adjacentStop) {
        const nearest = data.arrivalsAtStops.find(
          (s) => s.stop.stopId === data.adjacentStop!.stopId,
        );
        if (nearest) setFocusedStopId(nearest.stop.stopId);
        hasSetInitialFocusRef.current = true;
      }
    } catch (err: any) {
      if (err.name !== "AbortError") setError("Failed to load service info");
    }
  };

  // reset focus when changing services
  useEffect(() => {
    hasSetInitialFocusRef.current = false;
    setFocusedStopId(null);
  }, [routeShortName, tripHeadsign, directionId]);

  /* -------------------- RELOAD -------------------- */

  const reload = async (isPullRefresh = false) => {
    if (isPullRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      await fetchService();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* -------------------- POLLING -------------------- */

  const startPolling = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => fetchService(), 30000);
  };
  const stopPolling = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
    fetchControllerRef.current?.abort();
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await reload();
      if (mounted) startPolling();
    };

    init();

    return () => {
      mounted = false;
      stopPolling();
    };
  }, [routeShortName, tripHeadsign, dir, location?.lat, location?.lon]);

  /* -------------------- BACKGROUND HANDLING -------------------- */

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const wasActive = appState.current === "active";

        if (wasActive && nextState.match(/inactive|background/)) stopPolling();
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          reload();
          startPolling();
        }

        appState.current = nextState;
      },
    );
    return () => subscription.remove();
  }, []);

  /* -------------------- NEAREST STOP INDEX -------------------- */

  const nearestIndex = useMemo(() => {
    if (!service?.adjacentStop) return -1;
    return service.arrivalsAtStops.findIndex(
      (s) => s.stop.stopId === service.adjacentStop!.stopId,
    );
  }, [service]);

  /* -------------------- SCROLL TO FOCUSED STOP -------------------- */

  const prevFocusedStopIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!service || !focusedStopId) return;

    // don't scroll if stop hasn't changed
    if (prevFocusedStopIdRef.current === focusedStopId) return;

    const index = service.arrivalsAtStops.findIndex(
      (s) => s.stop.stopId === focusedStopId,
    );
    if (index < 0) return;
    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });

    prevFocusedStopIdRef.current = focusedStopId;
  }, [focusedStopId, service]);

  /* -------------------- UI -------------------- */

  const isInitialLoading = loading && !service;
  const isEmpty = !loading && service && service.arrivalsAtStops.length === 0;

  const hasValidStops =
    service?.arrivalsAtStops &&
    service.arrivalsAtStops.length > 0 &&
    service.arrivalsAtStops.every(
      (s) => s.stop && s.stop.stopLat && s.stop.stopLon,
    );

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      {/* Header */}
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
          <Text style={{ fontSize: 24, fontWeight: "700", color: "#242b4c" }}>
            {routeShortName || "—"}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#242b4c" }}>
            to {tripHeadsign || "—"}
          </Text>
        </View>
      </View>

      <View style={{ backgroundColor: "#eee", flex: 1 }}>
        {isInitialLoading && <Spinner />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {isEmpty && <ErrorState message="No service data available" />}

        {hasValidStops ? (
          <ServiceMap
            stops={service.arrivalsAtStops}
            focusedStopId={focusedStopId}
            onFocusStop={(stopId) => setFocusedStopId(stopId)}
            shape={service.shape}
            routeColor={
              service.routeColor ? `#${service.routeColor}` : "#ef60a3"
            }
          />
        ) : null}

        {hasValidStops ? (
          <FlatList
            data={service.arrivalsAtStops}
            keyExtractor={(item) => item.stop.stopId}
            ref={listRef}
            style={{ backgroundColor: "#eee" }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => reload(true)}
              />
            }
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }, 300);
            }}
            renderItem={({ item }) => (
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
        ) : null}
      </View>
    </View>
  );
}
