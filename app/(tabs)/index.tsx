import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = (signal?: AbortSignal) => {
    if (!location) return Promise.resolve();

    return fetchNearestServices(location.lat, location.lon, radius, signal)
      .then((data) => {
        if (!Array.isArray(data)) return;
        setServices(data);
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

      if (!showSpinner) {
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

      {locLoading || (loading && <Spinner />)}
      {locError && (
        <ErrorState
          message={locError}
          onRetry={() => {
            /* TODO: retry logic */
          }}
        />
      )}
      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            /* TODO: retry logic */
          }}
        />
      )}
      {!location && <ErrorState message="Location unavailable" />}
      {!loading && services.length === 0 && (
        <EmptyState text="No nearby services" />
      )}

      <FlatList
        data={services}
        style={{ backgroundColor: "#eee" }}
        keyExtractor={(item) =>
          item.serviceGroup.routeShortName +
          item.serviceGroup.tripHeadsign +
          item.serviceGroup.directionId
        }
        renderItem={({ item }) => (
          <ServiceCard service={item} userLocation={location} />
        )}
      />
    </View>
  );
}
