import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchServicesByPrefix } from "../../src/api/services";
import { EmptyState } from "../../src/components/EmptyState";
import { ErrorState } from "../../src/components/ErrorState";
import { Header } from "../../src/components/Header";
import { ServiceCardBrief } from "../../src/components/ServiceCardBrief";
import { Spinner } from "../../src/components/Spinner";
import { BriefServiceResponse } from "../../src/types";

const NUMBER_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["CLR", "0", "⌫"],
];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function SearchServicesScreen() {
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [services, setServices] = useState<BriefServiceResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = (query: string, signal?: AbortSignal) => {
    return fetchServicesByPrefix(query, signal)
      .then((data) => {
        if (!Array.isArray(data)) return;
        setServices(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load services");
        }
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchServices(query, controller.signal).finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  const isInitialLoading = loading && !services.length;

  let content = null;
  if (isInitialLoading) {
    content = <Spinner />;
  } else if (error) {
    content = (
      <ErrorState
        message={error}
        onRetry={() => {
          /* TODO */
        }}
      />
    );
  } else if (!services.length) {
    content = <EmptyState text="No matching services" />;
  } else {
    content = (
      <FlatList
        data={services}
        keyExtractor={(item) =>
          item.serviceGroup.routeShortName +
          item.serviceGroup.tripHeadsign +
          item.serviceGroup.directionId +
          item.routeLongName
        }
        renderItem={({ item }) => <ServiceCardBrief service={item} />}
      />
    );
  }

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      {/* RESULTS */}
      <View style={{ flex: 7, backgroundColor: "#eee" }}>
        <Header title={`Search: ${query || "—"}`} />

        {content}
      </View>

      {/* KEYPAD */}
      <View
        style={{
          flex: 3,
          flexDirection: "row",
          backgroundColor: "#ef60a3",
          padding: 4,
        }}
      >
        {/* NUMBERS */}
        <View style={{ flex: 2 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#eee",
            }}
          >
            {NUMBER_ROWS.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flex: 1,
                  flexDirection: "row",
                }}
              >
                {row.map((label) => (
                  <Key
                    key={label}
                    label={label}
                    onPress={() => {
                      if (label === "CLR") setQuery("");
                      else if (label === "⌫") setQuery((q) => q.slice(0, -1));
                      else setQuery((q) => q + label);
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* LETTERS */}
        <ScrollView style={{ flex: 1, paddingLeft: 4 }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              backgroundColor: "#eee",
            }}
          >
            {LETTERS.map((l) => (
              <LetterKey
                key={l}
                label={l}
                onPress={() => setQuery((q) => q + l)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function Key({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",

        borderWidth: 2,
        borderColor: "#ef60a3",
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function LetterKey({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexGrow: 1,
        flexBasis: "33%",
        padding: 8,
        alignItems: "center",
        justifyContent: "center",

        borderWidth: 2,
        borderColor: "#ef60a3",
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
  );
}
