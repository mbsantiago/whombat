import { type ReactNode, type ComponentProps } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import "leaflet/dist/leaflet.css";

type Position = {
  lat: number | null;
  lng: number | null;
};

export default function Map({
  children,
  center,
  zoom = 13,
  ...props
}: {
  children: ReactNode;
  center: Position;
  zoom?: number;
} & Omit<ComponentProps<typeof MapContainer>, "center" | "zoom">) {
  return (
    <MapContainer
      center={{
        lat: center.lat ?? 0,
        lng: center.lng ?? 0,
      }}
      zoom={zoom}
      scrollWheelZoom={false}
      {...props}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
