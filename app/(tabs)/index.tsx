import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = (signal?: AbortSignal) => {
    if (!location) return Promise.resolve();

    return fetchNearestServices(location.lat, location.lon, signal)
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
    const runFetch = () => {
      const controller = new AbortController();

      fetchServices(controller.signal);

      return controller;
    };

    let controller = runFetch();

    // first load (with spinner)
    setLoading(true);
    setError(null);

    fetchServices(controller.signal).finally(() => {
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
  }, [location?.lat, location?.lon]);

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
      }}
    >
      <Header title="Nearby Services" />

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
