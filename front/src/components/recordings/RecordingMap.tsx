import dynamic from "next/dynamic";

import Card from "@/components/Card";
import { MapIcon } from "@/components/icons";
import { type Recording } from "@/api/schemas";

// NOTE: The use of dynamic imports is necessary to avoid
// importing the leaflet library on the server side as it
// uses the `window` object which is not available on the server.
const Map = dynamic(() => import("@/components/maps/Map"), { ssr: false });
const Marker = dynamic(() => import("@/components/maps/DraggableMarker"), {
  ssr: false,
});

export default function RecordingMap({ recording }: { recording: Recording }) {
  const hasLocation = recording.latitude != null && recording.longitude != null;

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
              lat: recording.latitude ?? 0,
              lng: recording.longitude ?? 0,
            }}
            scrollWheelZoom={true}
            zoom={14}
          >
            <Marker
              draggable={false}
              updateOnChange
              center={{
                lat: recording.latitude ?? 0,
                lng: recording.longitude ?? 0,
              }}
            />
          </Map>
        </div>
      )}
    </Card>
  );
}
