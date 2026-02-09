import { StyleSheet } from "react-native";
import { colors } from "./theme";

export const commonStyles = StyleSheet.create({
  collapsibleCard: {
    marginVertical: 0.5,
    backgroundColor: "white",
    borderRadius: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  collapsibleHeader: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  collapsibleHeaderContents: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  chevron: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  chevronContainer: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
