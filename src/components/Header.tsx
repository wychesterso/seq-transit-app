import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#800000",
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
});
