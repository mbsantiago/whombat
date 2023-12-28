"use client";
import { divIcon } from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "react-leaflet/hooks";
import { Marker as LeafletMarker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import "leaflet/dist/leaflet.css";

// Taken from https://heroicons.com/
const MAP_PIN = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
</svg>
`;

type Position = {
  lat: number | null;
  lng: number | null;
};

export default function Marker({
  center,
  onChange,
  draggable = true,
  updateOnChange = false,
}: {
  center: Position;
  draggable?: boolean;
  onChange?: (position: Position) => void;
  updateOnChange?: boolean;
}) {
  const [position, setPosition] = useState<Position>(center);
  const map = useMap();

  // Update the map position when the marker position changes
  // and refocus the map on the marker
  useEffect(() => {
    if (center.lat == null || center.lng == null) return;
    if (isNaN(center.lat) || isNaN(center.lng)) return;

    setPosition(center);

    if (updateOnChange) {
      // @ts-ignore
      map.flyTo(center, 12);
    }
  }, [center, updateOnChange, map]);

  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          // @ts-ignore
          const latlng = marker.getLatLng();
          setPosition(latlng);
          onChange?.(latlng);
        }
      },
    }),
    [onChange],
  );

  return (
    <LeafletMarker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={{
        lat: position.lat ?? 0,
        lng: position.lng ?? 0,
      }}
      ref={markerRef}
      icon={divIcon({
        className: "marker text-emerald-500 fill-emerald-500",
        html: MAP_PIN,
      })}
    >
      <Popup minWidth={90}>
        <span>
          Lat: {position.lat}, Lon: {position.lng}
        </span>
      </Popup>
    </LeafletMarker>
  );
}
