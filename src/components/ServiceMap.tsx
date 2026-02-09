import { useEffect, useRef, useState } from "react";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { ArrivalsAtStopResponse } from "../types";

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY!;

interface ServiceMapProps {
  stops: ArrivalsAtStopResponse[];
  focusedStopId: string | null;
  onFocusStop?: (stopId: string) => void;
}

export const ServiceMap: React.FC<ServiceMapProps> = ({
  stops,
  focusedStopId,
  onFocusStop,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const prevFocusedStopRef = useRef<string | null>(null); // track previously focused stop

  useEffect(() => {
    if (!mapReady || !focusedStopId) return;

    if (prevFocusedStopRef.current === focusedStopId) return;
    prevFocusedStopRef.current = focusedStopId;

    const stop = stops.find((s) => s.stop.stopId === focusedStopId)?.stop;
    if (!stop) return;

    mapRef.current?.animateCamera({
      center: {
        latitude: stop.stopLat,
        longitude: stop.stopLon,
      },
      zoom: 16,
    });
  }, [focusedStopId, mapReady, stops]);

  if (stops.length === 0) return null;

  return (
    <MapView
      ref={mapRef}
      style={{ height: 300 }}
      onMapReady={() => setMapReady(true)}
      initialRegion={{
        latitude: stops[0].stop.stopLat,
        longitude: stops[0].stop.stopLon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <UrlTile
        urlTemplate={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`}
        maximumZ={19}
        flipY={false}
      />

      {stops.map((s) => (
        <Marker
          key={s.stop.stopId}
          coordinate={{
            latitude: s.stop.stopLat,
            longitude: s.stop.stopLon,
          }}
          onPress={() => onFocusStop?.(s.stop.stopId)}
        />
      ))}
    </MapView>
  );
};
