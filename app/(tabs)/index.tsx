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

const MOCK_SERVICES: ServiceResponse[] = [
  {
    routeShortName: "402",
    routeLongName: "402 Long Name",
    serviceGroup: {
      routeShortName: "402",
      tripHeadsign: "University of Queensland",
      directionId: 0,
    },
    arrivalsAtNearestStop: {
      stop: {
        stopId: "1234",
        stopCode: "1234",
        stopName: "Benson St, stop 14",
        stopLat: -27.486865,
        stopLon: 152.993143,
        zoneId: "1",
      },
      stopSequence: 1,
      nextThreeArrivals: [
        {
          tripId: "t1",
          scheduledArrivalSeconds: 0,
          scheduledArrivalLocal: "",
          effectiveArrivalSeconds: Math.floor(Date.now() / 1000) + 180,
          effectiveArrivalLocal: "",
          arrivalDelaySeconds: 0,
          scheduledDepartureSeconds: 0,
          scheduledDepartureLocal: "",
          effectiveDepartureSeconds: 0,
          effectiveDepartureLocal: "",
          departureDelaySeconds: 0,
          realTime: true,
          cancelled: false,
          skipped: false,
        },
        {
          tripId: "t2",
          scheduledArrivalSeconds: 0,
          scheduledArrivalLocal: "",
          effectiveArrivalSeconds: Math.floor(Date.now() / 1000) + 360,
          effectiveArrivalLocal: "",
          arrivalDelaySeconds: 0,
          scheduledDepartureSeconds: 0,
          scheduledDepartureLocal: "",
          effectiveDepartureSeconds: 0,
          effectiveDepartureLocal: "",
          departureDelaySeconds: 0,
          realTime: false,
          cancelled: false,
          skipped: false,
        },
        {
          tripId: "t3",
          scheduledArrivalSeconds: 0,
          scheduledArrivalLocal: "",
          effectiveArrivalSeconds: Math.floor(Date.now() / 1000) + 540,
          effectiveArrivalLocal: "",
          arrivalDelaySeconds: 0,
          scheduledDepartureSeconds: 0,
          scheduledDepartureLocal: "",
          effectiveDepartureSeconds: 0,
          effectiveDepartureLocal: "",
          departureDelaySeconds: 0,
          realTime: false,
          cancelled: false,
          skipped: false,
        },
      ],
    },
  },
  {
    routeShortName: "412",
    routeLongName: "412 Long Name",
    serviceGroup: {
      routeShortName: "412",
      tripHeadsign: "St Lucia",
      directionId: 0,
    },
    arrivalsAtNearestStop: {
      stop: {
        stopId: "1234",
        stopCode: "1234",
        stopName: "Benson St, stop 14",
        stopLat: -27.486865,
        stopLon: 152.993143,
        zoneId: "1",
      },
      stopSequence: 1,
      nextThreeArrivals: [
        {
          tripId: "t1",
          scheduledArrivalSeconds: 0,
          scheduledArrivalLocal: "",
          effectiveArrivalSeconds: Math.floor(Date.now() / 1000) + 180,
          effectiveArrivalLocal: "",
          arrivalDelaySeconds: 0,
          scheduledDepartureSeconds: 0,
          scheduledDepartureLocal: "",
          effectiveDepartureSeconds: 0,
          effectiveDepartureLocal: "",
          departureDelaySeconds: 0,
          realTime: true,
          cancelled: false,
          skipped: false,
        },
        {
          tripId: "t2",
          scheduledArrivalSeconds: 0,
          scheduledArrivalLocal: "",
          effectiveArrivalSeconds: Math.floor(Date.now() / 1000) + 360,
          effectiveArrivalLocal: "",
          arrivalDelaySeconds: 0,
          scheduledDepartureSeconds: 0,
          scheduledDepartureLocal: "",
          effectiveDepartureSeconds: 0,
          effectiveDepartureLocal: "",
          departureDelaySeconds: 0,
          realTime: false,
          cancelled: false,
          skipped: false,
        },
        {
          tripId: "t3",
          scheduledArrivalSeconds: 0,
          scheduledArrivalLocal: "",
          effectiveArrivalSeconds: Math.floor(Date.now() / 1000) + 720,
          effectiveArrivalLocal: "",
          arrivalDelaySeconds: 0,
          scheduledDepartureSeconds: 0,
          scheduledDepartureLocal: "",
          effectiveDepartureSeconds: 0,
          effectiveDepartureLocal: "",
          departureDelaySeconds: 0,
          realTime: false,
          cancelled: false,
          skipped: false,
        },
      ],
    },
  },
];

function hasArrivals(service: ServiceResponse): boolean {
  const arrivals = service.arrivalsAtNearestStop?.nextThreeArrivals;
  return arrivals && arrivals.length > 0;
}

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

  // render logic
  if (locLoading || loading) {
    return <Spinner />;
  }

  if (locError) {
    return <ErrorState message={locError} />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          /* TODO: retry logic */
        }}
      />
    );
  }

  if (!location) {
    return <ErrorState message="Location unavailable" />;
  }

  if (services.length === 0) {
    return <EmptyState text="No nearby services" />;
  }

  return (
    <View
      style={{
        paddingTop: insets.top,
        flex: 1,
      }}
    >
      <Header title="Nearby Services" />

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
