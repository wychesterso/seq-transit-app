import { FlatList, Text, View } from "react-native";
import { ServiceCard } from "../../src/components/ServiceCard";
import { useLocation } from "../../src/hooks/useLocation";
import { BriefServiceResponse } from "../../src/types";

const MOCK_SERVICES: BriefServiceResponse[] = [
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

export default function NearbyServicesScreen() {
  const { location, loading, error } = useLocation();

  if (loading) return <Text>Loading location...</Text>;
  if (error || !location)
    return <Text>{error || "Failed to get location"}</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: "#800000", padding: 1.5 }}>
      <Text
        style={{
          color: "white",
          fontSize: 24,
          fontWeight: "600",
          marginBottom: 12,
        }}
      >
        Nearby Services
      </Text>

      <FlatList
        data={MOCK_SERVICES}
        keyExtractor={(item) =>
          item.serviceGroup.routeShortName + item.serviceGroup.tripHeadsign
        }
        renderItem={({ item }) => (
          <ServiceCard service={item} userLocation={location} />
        )}
      />
    </View>
  );
}
