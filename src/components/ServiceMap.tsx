import { useEffect, useRef, useState } from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { ArrivalsAtStopResponse, CoordinatePoint } from "../types";

interface ServiceMapProps {
  stops: ArrivalsAtStopResponse[];
  focusedStopId: string | null;
  onFocusStop?: (stopId: string) => void;
  shape?: CoordinatePoint[];
  routeColor?: string;
}

export const ServiceMap: React.FC<ServiceMapProps> = ({
  stops = [],
  focusedStopId,
  onFocusStop,
  shape,
  routeColor,
}) => {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const prevFocusedStopRef = useRef<string | null>(null); // track previously focused stop

  useEffect(() => {
    if (!mapReady || !focusedStopId || stops.length === 0) return;

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

  if (!stops || stops.length === 0) return null;

  const firstStop = stops[0].stop;
  if (
    !firstStop ||
    !Number.isFinite(firstStop.stopLat) ||
    !Number.isFinite(firstStop.stopLon)
  ) {
    return null;
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      ref={mapRef}
      style={{ height: 300 }}
      onMapReady={() => setMapReady(true)}
      initialRegion={{
        latitude: firstStop.stopLat,
        longitude: firstStop.stopLon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {shape && shape.length > 0 && (
        <Polyline
          coordinates={shape
            .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
            .map((p) => ({
              latitude: p.lat,
              longitude: p.lon,
            }))}
          strokeWidth={8}
          strokeColor={routeColor || "#000"}
        />
      )}
      {stops
        .filter(
          (s) =>
            s.stop &&
            Number.isFinite(s.stop.stopLat) &&
            Number.isFinite(s.stop.stopLon),
        )
        .map((s) => (
          <Marker
            key={`${s.stop.stopId}-${focusedStopId === s.stop.stopId}`}
            pinColor={s.stop.stopId === focusedStopId ? "tomato" : "wheat"}
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
