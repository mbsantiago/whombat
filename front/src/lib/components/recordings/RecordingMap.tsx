import dynamic from "next/dynamic";

import { MapIcon } from "@/lib/components/icons";
import Card from "@/lib/components/ui/Card";

import type { Recording } from "@/lib/types";

// NOTE: The use of dynamic imports is necessary to avoid importing the leaflet
// library on the server side as it uses the `window` object which is not
// available on the server.
const Map = dynamic(() => import("@/lib/components/maps/Map"), { ssr: false });
const Marker = dynamic(() => import("@/lib/components/maps/DraggableMarker"), {
  ssr: false,
});

export default function RecordingMap({
  recording: { latitude, longitude },
}: {
  recording: Recording;
}) {
  const hasLocation = latitude != null && longitude != null;

  return (
    <Card>
      <div className="flex flex-row justify-center items-center">
        <MapIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
        Recorded at
      </div>
      {!hasLocation ? (
        <div className="text-sm text-stone-400 dark:text-stone-600">
          No location provided.
        </div>
      ) : (
        <div className="relative">
          <Map
            className="h-64"
            center={{
              lat: latitude ?? 0,
              lng: longitude ?? 0,
            }}
            scrollWheelZoom={true}
            zoom={14}
          >
            <Marker
              draggable={false}
              updateOnChange
              center={{
                lat: latitude ?? 0,
                lng: longitude ?? 0,
              }}
            />
          </Map>
        </div>
      )}
    </Card>
  );
}
