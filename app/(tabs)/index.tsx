import { commonStyles } from "@/src/styles/commonStyles";
import { useEffect, useState } from "react";
import { SectionList, Text, TouchableOpacity, View } from "react-native";
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
  const [error, setError] = useState<string | null>(null);

  const fetchServices = (signal?: AbortSignal) => {
    if (!location) return Promise.resolve();

    return fetchNearestServices(location.lat, location.lon, radius, signal)
      .then((data) => {
        if (!Array.isArray(data)) return;

        setServices(data);

        // const sorted = [...data].sort((a, b) => {
        //   return a.serviceGroup.routeShortName.localeCompare(
        //     b.serviceGroup.routeShortName,
        //     undefined,
        //     { numeric: true },
        //   );
        // });

        // setServices(sorted);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load nearby services");
        }
      });
  };

  useEffect(() => {
    if (!location) return;

    let isMounted = true;
    let controller: AbortController;

    const runFetch = (showSpinner = false) => {
      controller?.abort();
      controller = new AbortController();

      if (showSpinner) {
        setLoading(true);
        setError(null);
      }

      fetchServices(controller.signal).finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    };

    // first load (with spinner)
    runFetch(true);

    // refresh every 15s
    const interval = setInterval(() => {
      runFetch(false);
    }, 15000);

    // cleanup
    return () => {
      isMounted = false;
      controller?.abort();
      clearInterval(interval);
    };
  }, [location?.lat, location?.lon, radius]);

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
  const isRefreshing = (locLoading || loading) && hasData;

  let content = null;
  if (isInitialLoading) {
    content = <Spinner />;
  } else if (locError) {
    content = (
      <ErrorState
        message={locError}
        onRetry={() => {
          /* TODO */
        }}
      />
    );
  } else if (error) {
    content = (
      <ErrorState
        message={error}
        onRetry={() => {
          /* TODO */
        }}
      />
    );
  } else if (!location) {
    content = <ErrorState message="Location unavailable" />;
  } else if (!hasData) {
    content = <EmptyState text="No nearby services" />;
  } else {
    content = (
      <SectionList
        sections={sections}
        style={{ backgroundColor: "#eee" }}
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
