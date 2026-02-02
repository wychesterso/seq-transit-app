import haversine from "haversine-distance";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArrivalResponse, ServiceResponse } from "../types/index";
import { getBrisbaneSecondsSinceMidnight } from "../utils/time";

interface ServiceCardProps {
  service: ServiceResponse;
  userLocation: { lat: number; lon: number };
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  userLocation,
}) => {
  const { serviceGroup, routeShortName, arrivalsAtNearestStop } = service;
  const stop = arrivalsAtNearestStop?.stop;

  // distance from user
  const distanceMeters = stop
    ? haversine(
        { lat: userLocation.lat, lon: userLocation.lon },
        { lat: stop.stopLat, lon: stop.stopLon },
      )
    : null;

  // format next 3 arrivals
  const nextArrivals = arrivalsAtNearestStop?.nextThreeArrivals
    ?.map((a: ArrivalResponse) => {
      const nowBrisbaneSeconds = getBrisbaneSecondsSinceMidnight();
      const secondsFromNow = a.effectiveArrivalSeconds - nowBrisbaneSeconds;

      return secondsFromNow > 0 ? Math.ceil(secondsFromNow / 60) : 0;
    })
    .slice(0, 3);
  const hasArrivals = Array.isArray(nextArrivals) && nextArrivals.length > 0;

  return (
    <View style={styles.card}>
      {/* LEFT */}
      <View style={styles.left}>
        <Text style={styles.route}>{routeShortName}</Text>
      </View>

      {/* MIDDLE */}
      <View style={styles.middle}>
        <Text style={styles.headsign}>{serviceGroup.tripHeadsign}</Text>
        <Text style={styles.stop}>
          {stop?.stopName}
          {distanceMeters != null
            ? ` · ${(distanceMeters / 1000).toFixed(2)} km`
            : ""}
        </Text>
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        {hasArrivals ? (
          nextArrivals?.map((min, idx) => {
            const isFirst = idx === 0;

            if (min > 0) {
              return (
                <Text
                  key={idx}
                  style={isFirst ? styles.arrivalPrimary : styles.arrival}
                >
                  {min} min
                </Text>
              );
            }
            if (min === 0) {
              return (
                <Text
                  key={idx}
                  style={isFirst ? styles.arrivalPrimary : styles.arrival}
                >
                  - min
                </Text>
              );
            }
            return (
              <Text key={idx} style={styles.arrivalEmpty}>
                —
              </Text>
            );
          })
        ) : (
          <Text style={styles.arrivalEmpty}>⚠︎</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 0.25,
    backgroundColor: "white",
    borderRadius: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  /* LEFT */
  left: {
    flex: 1, // 15%
    alignItems: "center",
    justifyContent: "center",
  },
  route: {
    fontSize: 21,
    fontWeight: "700",
  },

  /* MIDDLE */
  middle: {
    flex: 4.25, // 70%
    paddingHorizontal: 8,
  },
  headsign: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  stop: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  /* RIGHT */
  right: {
    flex: 1.25, // 15%
    alignItems: "flex-end",
  },
  arrival: {
    fontSize: 13,
    fontWeight: "500",
  },
  arrivalPrimary: {
    fontSize: 17,
    fontWeight: "700",
    color: "#00a2ffff",
  },
  arrivalEmpty: {
    fontSize: 13,
    color: "#bbb",
  },
});
