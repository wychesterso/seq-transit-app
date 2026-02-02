import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BriefServiceResponse } from "../types/index";

interface ServiceCardBriefProps {
  service: BriefServiceResponse;
}

export const ServiceCardBrief: React.FC<ServiceCardBriefProps> = ({
  service,
}) => {
  const { serviceGroup, routeShortName, routeLongName } = service;

  return (
    <View style={styles.card}>
      {/* LEFT */}
      <View style={styles.left}>
        <Text style={styles.route}>{routeShortName}</Text>
      </View>

      {/* RIGHT */}
      <View style={styles.right}>
        <Text style={styles.headsign}>{serviceGroup.tripHeadsign}</Text>
        <Text style={styles.stop}>{routeLongName}</Text>
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

  /* RIGHT */
  right: {
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
});
