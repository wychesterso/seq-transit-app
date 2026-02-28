import { commonStyles } from "@/src/styles/commonStyles";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  RefreshControl,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchNearestServices } from "../../src/api/services";
import { EmptyState } from "../../src/components/EmptyState";
import { ErrorState } from "../../src/components/ErrorState";
import { Header } from "../../src/components/Header";
import { ServiceCard } from "../../src/components/ServiceCard";
import { Spinner } from "../../src/components/Spinner";
import { useLocation } from "../../src/hooks/useLocation";
import { ServiceResponse } from "../../src/types";

export default function NearbyServicesScreen() {
  const insets = useSafeAreaInsets();

  const { location, loading: locLoading, error: locError } = useLocation();

  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [radius, setRadius] = useState<"SMALL" | "MEDIUM" | "LARGE" | "XL">(
    "LARGE",
  );
  const [collapsed, setCollapsed] = useState({
    bus: false,
    rail: false,
    ferry: false,
    lightRail: false,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const appState = useRef(AppState.currentState);

  /* -------------------- FETCH -------------------- */

  const fetchServices = (signal?: AbortSignal) => {
    if (!location) return Promise.resolve();

    return fetchNearestServices(location.lat, location.lon, radius, signal)
      .then((data) => {
        if (!Array.isArray(data)) return;

        setError(null);
        setServices(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load nearby services");
        }
      });
  };

  /* -------------------- RELOAD -------------------- */

  const reload = async (showSpinner = true, isPullRefresh = false) => {
    if (!location) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    if (showSpinner && !isPullRefresh) {
      setLoading(true);
      setError(null);
    }
    if (isPullRefresh) setRefreshing(true);

    try {
      await fetchServices(controller.signal);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* -------------------- POLL -------------------- */

  const startPolling = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      reload(false);
    }, 30000); // 30s
  };

  const stopPolling = () => {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
    controllerRef.current?.abort();
  };

  useEffect(() => {
    if (!location) return;

    reload(true);
    startPolling();

    return stopPolling;
  }, [location?.lat, location?.lon, radius]);

  /* -------------------- BACKGROUND HANDLING -------------------- */

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const wasActive = appState.current === "active";

        if (wasActive && nextState.match(/inactive|background/)) {
          stopPolling();
        }

        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          reload(false);
          startPolling();
        }

        appState.current = nextState;
      },
    );

    return () => subscription.remove();
  }, []);

  /* -------------------- CONTENT -------------------- */

  const hasData = services.length > 0;
  const sections = [
    {
      key: "bus",
      title: "Bus",
      data: services.filter((s) => s.routeType === 3),
    },
    {
      key: "rail",
      title: "Rail",
      data: services.filter((s) => s.routeType === 2),
    },
    {
      key: "ferry",
      title: "Ferry",
      data: services.filter((s) => s.routeType === 4),
    },
    {
      key: "lightRail",
      title: "Light Rail / Tram",
      data: services.filter((s) => s.routeType === 0),
    },
  ]
    // remove empty groups
    .filter((s) => s.data.length > 0)
    // collapse handling
    .map((s) => ({
      ...s,
      data: collapsed[s.key as keyof typeof collapsed] ? [] : s.data,
    }));

  const isInitialLoading = (locLoading || loading) && !hasData;

  let content = null;
  if (isInitialLoading) {
    content = <Spinner />;
  } else if (locError) {
    content = <ErrorState message={locError} onRetry={() => reload(true)} />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={() => reload(true)} />;
  } else if (!location) {
    content = <ErrorState message="Location unavailable" />;
  } else if (!hasData) {
    content = <EmptyState text="No nearby services" />;
  } else {
    content = (
      <SectionList
        sections={sections}
        style={{ backgroundColor: "#eee" }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => reload(false, true)}
          />
        }
        keyExtractor={(item) =>
          item.serviceGroup.routeShortName +
          item.serviceGroup.tripHeadsign +
          item.serviceGroup.directionId +
          item.routeLongName
        }
        renderItem={({ item }) => (
          <ServiceCard service={item} userLocation={location} />
        )}
        renderSectionHeader={({ section }) => {
          const isCollapsed = collapsed[section.key as keyof typeof collapsed];

          return (
            <TouchableOpacity
              onPress={() =>
                setCollapsed((prev) => ({
                  ...prev,
                  [section.key]: !prev[section.key as keyof typeof collapsed],
                }))
              }
              style={commonStyles.collapsibleCard}
            >
              <View style={commonStyles.collapsibleHeader}>
                <Text
                  style={commonStyles.collapsibleHeaderContents}
                  numberOfLines={isCollapsed ? 2 : undefined}
                >
                  {section.title}
                </Text>
                <View style={commonStyles.chevronContainer}>
                  <Text style={commonStyles.chevron}>
                    {isCollapsed ? "▼" : "▲"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        stickySectionHeadersEnabled={false}
      />
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
      }}
    >
      <Header title="Nearby Services" />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 4,
          backgroundColor: "#ef60a3",
        }}
      >
        {[
          { label: "100m", value: "SMALL" },
          { label: "250m", value: "MEDIUM" },
          { label: "500m", value: "LARGE" },
          { label: "1000m", value: "XL" },
        ].map((r) => {
          const selected = radius === r.value;

          return (
            <TouchableOpacity
              key={r.value}
              onPress={() => setRadius(r.value as any)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: "#d04e8b",
              }}
            >
              <Text style={{ color: selected ? "white" : "#333" }}>
                {r.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flex: 7, backgroundColor: "#eee" }}>{content}</View>
    </View>
  );
}
