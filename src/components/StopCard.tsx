import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrivalResponse, ArrivalsAtStopResponse } from "../types/index";
import { getMinutesUntilArrival } from "../utils/time";

interface StopCardProps {
  arrival: ArrivalsAtStopResponse;
}

export const StopCard: React.FC<StopCardProps> = ({ arrival }) => {
  const { stop, stopSequence, isFirstStop, nextThreeArrivals } = arrival;
  const stopName = stop.stopName;

  const getEffectiveSeconds = (a: ArrivalResponse): number => {
    return isFirstStop
      ? a.effectiveDepartureSeconds
      : a.effectiveArrivalSeconds;
  };

  const getScheduledSeconds = (a: ArrivalResponse): number => {
    return isFirstStop
      ? a.scheduledDepartureSeconds
      : a.scheduledArrivalSeconds;
  };

  const [expanded, setExpanded] = useState(false);

  // format next 3 arrivals
  const nextArrivals = nextThreeArrivals
    ?.map((a) => getMinutesUntilArrival(getEffectiveSeconds(a)))
    .slice(0, 3);
  const nextArrivalsScheduled = nextThreeArrivals
    ?.map((a: ArrivalResponse) => {
      return getMinutesUntilArrival(getScheduledSeconds(a));
    })
    .slice(0, 3);
  const isRealTime = nextThreeArrivals
    ?.map((a: ArrivalResponse) => a.realTime)
    .slice(0, 3);

  const hasArrivals = Array.isArray(nextArrivals) && nextArrivals.length > 0;

  return (
    <TouchableOpacity
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.7}
      style={styles.card}
    >
      {/* STOP NAME BANNER */}
      <View style={styles.top}>
        <Text style={styles.stopName} numberOfLines={expanded ? undefined : 2}>
          {stopSequence}. {stopName}
        </Text>
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
        </View>
      </View>

      {/* ARRIVALS (COLLAPSIBLE) */}
      {expanded && (
        <View style={styles.bottom}>
          {hasArrivals ? (
            nextArrivals?.map((min, idx) => {
              return (
                <View key={idx} style={styles.arrivalRow}>
                  <Text style={styles.arrivalNumber}>
                    {min > 0 ? min : min === 0 ? "-" : "—"}
                  </Text>
                  <Text style={styles.arrivalUnit}> min</Text>
                  <Text style={styles.arrivalScheduled}>
                    {nextArrivalsScheduled &&
                    nextArrivalsScheduled[idx] !== undefined &&
                    isRealTime[idx]
                      ? (() => {
                          const scheduled = nextArrivalsScheduled[idx];

                          if (min < 0 || scheduled < 0) {
                            return "scheduled";
                          }

                          const diff = scheduled - min;

                          if (diff === 0) {
                            return "on time";
                          }

                          const isEarly = diff > 0;
                          const value = Math.abs(diff);

                          return (
                            <>
                              <Text style={styles.arrivalUnitSmall}>
                                {isEarly ? "early " : "late "}
                              </Text>
                              <Text
                                style={[
                                  styles.arrivalDelta,
                                  isEarly ? styles.early : styles.late,
                                ]}
                              >
                                {value}
                              </Text>
                              <Text style={styles.arrivalUnitSmall}> min</Text>
                            </>
                          );
                        })()
                      : "scheduled"}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.arrivalEmpty}>
              No service information available
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 0.5,
    backgroundColor: "white",
    borderRadius: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  /* STOP NAME */
  top: {
    backgroundColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    fontSize: 18,
    color: "#666",
  },
  chevronContainer: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stopName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },

  /* ARRIVALS */
  bottom: {
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  arrivalEmpty: {
    fontSize: 16,
    color: "#bbb",
  },
  arrivalRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  arrivalNumber: {
    width: 32,
    textAlign: "right",
    fontSize: 17,
    fontWeight: "900",
    color: "#00a2ffff",
  },
  arrivalUnit: {
    fontSize: 17,
    fontWeight: "500",
    color: "#999",
  },
  arrivalScheduled: {
    fontSize: 12,
    fontWeight: "500",
    paddingLeft: 16,
    color: "#bbb",
  },
  arrivalDelta: {
    fontSize: 12,
    fontWeight: "900",
  },
  early: {
    color: "#66cc66",
  },
  late: {
    color: "#c20000",
  },
  arrivalUnitSmall: {
    fontSize: 12,
    fontWeight: "500",
    color: "#bbb",
  },
});
