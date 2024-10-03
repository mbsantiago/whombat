"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Group, Input } from "@/lib/components/inputs";

import useDebounceSubmit from "@/lib/hooks/forms/useDebounceSubmit";

// NOTE: The use of dynamic imports is necessary to avoid
// importing the leaflet library on the server side as it
// uses the `window` object which is not available on the server.
const Map = dynamic(() => import("@/lib/components/maps/Map"), { ssr: false });
const DraggableMarker = dynamic(
  () => import("@/lib/components/maps/DraggableMarker"),
  {
    ssr: false,
  },
);

export type Location = {
  latitude?: number | null;
  longitude?: number | null;
};

const numSchema = z.union([
  z.undefined(),
  z.null(),
  z.number(),
  z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return null;
    return num;
  }),
]);

const schema = z.object({
  latitude: numSchema,
  longitude: numSchema,
});

export default function LocationInput({
  value,
  onChange,
  disabled,
}: {
  value: Location;
  onChange?: (value: Location) => void;
  disabled?: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    values: value,
    resolver: zodResolver(schema),
  });

  useDebounceSubmit({
    value,
    onSubmit: onChange,
    watch,
    handleSubmit,
  });

  const position: Location = watch();

  return (
    <div className="flex flex-col">
      {!disabled && (
        <div className="flex flex-row gap-2 justify-center items-center p-2">
          <Group name="latitude" label="lat" error={errors.latitude?.message}>
            <Input
              type="number"
              {...register("latitude")}
              min={-90}
              max={90}
              step="any"
            />
          </Group>
          <Group name="longitude" label="lon" error={errors.longitude?.message}>
            <Input
              type="number"
              {...register("longitude")}
              min={-180}
              max={180}
              step="any"
            />
          </Group>
        </div>
      )}
      <div className="relative inline-flex justify-center p-2">
        {position.latitude != null && position.longitude != null && (
          <Map
            center={{ lat: position.latitude, lng: position.longitude }}
            className="w-64 h-64"
          >
            <DraggableMarker
              center={{ lat: position.latitude, lng: position.longitude }}
              updateOnChange
              onChange={(position) => {
                if (position.lat == null || position.lng == null) return;
                if (isNaN(position.lat) || isNaN(position.lng)) return;
                onChange?.({ latitude: position.lat, longitude: position.lng });
              }}
            />
          </Map>
        )}
      </div>
    </div>
  );
}

function formatDegrees(value: number): string {
  return (parseFloat(value.toFixed(5)) ?? 0).toString();
}

export function formatLocation(value: Location): string {
  const { latitude, longitude } = value;

  if (latitude == null || longitude == null) {
    return "";
  }

  return `${formatDegrees(latitude)}, ${formatDegrees(longitude)}`;
}
