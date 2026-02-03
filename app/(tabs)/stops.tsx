import { Header } from "@/src/components/Header";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
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

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    const controller = new AbortController();
    setLoadingStops(true);
    setError(null);

    fetchNearestStops(location.lat, location.lon, controller.signal)
      .then((data) => {
        setStops(data);
        if (data.length > 0) {
          setSelectedStopId(data[0].stopId); // select first stop by default
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load nearby stops");
        }
      })
      .finally(() => setLoadingStops(false));

    return () => controller.abort();
  }, [location?.lat, location?.lon]);

  useEffect(() => {
    if (!selectedStopId) return;

    const controller = new AbortController();
    setLoadingServices(true);
    setError(null);

    fetchServicesAtStop(selectedStopId, controller.signal)
      .then(setServices)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load services");
        }
      })
      .finally(() => setLoadingServices(false));

    return () => controller.abort();
  }, [selectedStopId]);

  if (locLoading || loadingStops) return <Spinner />;
  if (locError) return <ErrorState message={locError} />;
  if (error) return <ErrorState message={error} />;

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      <Header title="Nearby Stops" />

      <View style={{ backgroundColor: "#eee", flex: 1 }}>
        {/* STOP TABS */}
        <View style={{ height: 40 }}>
          <FlatList
            data={stops}
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
        {loadingServices && <Spinner />}

        {!loadingServices && services.length === 0 && (
          <EmptyState text="No services at this stop" />
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
            <ServiceCard service={item} userLocation={location!} />
          )}
        />
      </View>
    </View>
  );
}
