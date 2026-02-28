import { Header } from "@/src/components/Header";
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
import { fetchServicesAtStop } from "../../src/api/services";
import { fetchNearestStops } from "../../src/api/stops";
import { EmptyState } from "../../src/components/EmptyState";
import { ErrorState } from "../../src/components/ErrorState";
import { ServiceCard } from "../../src/components/ServiceCard";
import { Spinner } from "../../src/components/Spinner";
import { useLocation } from "../../src/hooks/useLocation";
import { BriefStopResponse, ServiceResponse } from "../../src/types";

export default function NearbyStopsScreen() {
  const insets = useSafeAreaInsets();
  const { location, loading: locLoading, error: locError } = useLocation();

  const [stops, setStops] = useState<BriefStopResponse[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceResponse[]>([]);

  const [loadingStops, setLoadingStops] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopsControllerRef = useRef<AbortController | null>(null);
  const servicesControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);

  /* -------------------- FETCH -------------------- */

  const loadStops = async (signal?: AbortSignal) => {
    if (!location) return;
    stopsControllerRef.current?.abort();
    const controller = new AbortController();
    stopsControllerRef.current = controller;

    setLoadingStops(true);
    setError(null);

    try {
      const data = await fetchNearestStops(
        location.lat,
        location.lon,
        signal ?? controller.signal,
      );
      setStops(data);
      if (data.length > 0 && !selectedStopId) setSelectedStopId(data[0].stopId);
    } catch (err: any) {
      if (err.name !== "AbortError") setError("Failed to load nearby stops");
    } finally {
      setLoadingStops(false);
    }
  };

  const loadServices = async (stopId: string, signal?: AbortSignal) => {
    servicesControllerRef.current?.abort();
    const controller = new AbortController();
    servicesControllerRef.current = controller;

    setLoadingServices(true);
    setError(null);

    try {
      const data = await fetchServicesAtStop(
        stopId,
        signal ?? controller.signal,
      );
      setServices(data);
    } catch (err: any) {
      if (err.name !== "AbortError") setError("Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  /* -------------------- RELOAD -------------------- */

  const reload = async (isPullRefresh = false) => {
    if (!location) return;
    if (isPullRefresh) setRefreshing(true);

    try {
      await loadStops();
      if (selectedStopId) await loadServices(selectedStopId);
    } finally {
      setRefreshing(false);
    }
  };

  /* -------------------- POLLING -------------------- */

  const startPolling = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (selectedStopId) loadServices(selectedStopId);
    }, 30000); // 30s
  };

  const stopPolling = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
    servicesControllerRef.current?.abort();
    stopsControllerRef.current?.abort();
  };

  useEffect(() => {
    if (!location) return;

    reload();
    startPolling();

    return stopPolling;
  }, [location?.lat, location?.lon, selectedStopId]);

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

  /* -------------------- MEMOIZED LISTS -------------------- */

  const memoizedStops = useMemo(() => stops, [stops]);
  const memoizedServices = useMemo(() => services, [services]);

  /* -------------------- UI -------------------- */

  const isInitialLoading = (locLoading || loadingStops) && !stops.length;

  let content = null;
  if (isInitialLoading || loadingServices) {
    content = <Spinner />;
  } else if (locError) {
    content = <ErrorState message={locError} onRetry={() => reload()} />;
  } else if (error) {
    content = (
      <ErrorState
        message={error}
        onRetry={() => selectedStopId && loadServices(selectedStopId)}
      />
    );
  } else if (!services.length) {
    content = <EmptyState text="No services at this stop" />;
  } else {
    content = (
      <FlatList
        data={memoizedServices}
        style={{ backgroundColor: "#eee" }}
        keyExtractor={(item) =>
          item.serviceGroup.routeShortName +
          item.serviceGroup.tripHeadsign +
          item.serviceGroup.directionId +
          item.routeLongName
        }
        renderItem={({ item }) => (
          <ServiceCard service={item} userLocation={location!} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => reload(true)}
          />
        }
      />
    );
  }

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      <Header title="Nearby Stops" />

      {/* STOP TABS */}
      <View style={{ height: 40 }}>
        <FlatList
          data={memoizedStops}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.stopId}
          style={{ paddingVertical: 0, backgroundColor: "#ef60a3" }}
          renderItem={({ item }) => {
            const selected = item.stopId === selectedStopId;
            return (
              <TouchableOpacity
                onPress={() => setSelectedStopId(item.stopId)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  marginHorizontal: 4,
                  backgroundColor: "#d04e8b",
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 15,
                }}
              >
                <Text style={{ color: selected ? "white" : "#333" }}>
                  {item.stopName + " (" + item.stopId + ")"}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* SERVICES */}
      <View style={{ flex: 1, backgroundColor: "#eee" }}>{content}</View>
    </View>
  );
}
