import dynamic from "next/dynamic";
import Card from "@/components/Card";
import { MapIcon } from "@/components/icons";
import { type Recording } from "@/api/recordings";

// NOTE: The use of dynamic imports is necessary to avoid
// importing the leaflet library on the server side as it
// uses the `window` object which is not available on the server.
const Map = dynamic(() => import("@/components/Map"), { ssr: false });
const Marker = dynamic(() => import("@/components/DraggableMarker"), {
  ssr: false,
});

export default function RecordingMap({ recording }: { recording: Recording }) {
  const hasLocation = recording.latitude != null && recording.longitude != null;

  return (
    <Card>
      <div className="flex flex-row items-center justify-center">
        <MapIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
        Recorded at
      </div>
      {!hasLocation ? (
        <div className="dark:text-stone-600 text-stone-400 text-sm">
          No location provided.
        </div>
      ) : (
        <div className="relative">
          <Map
            className="h-64"
            center={{
              lat: recording.latitude,
              lng: recording.longitude,
            }}
            scrollWheelZoom={true}
            zoom={14}
          >
            <Marker
              draggable={false}
              center={{
                lat: recording.latitude,
                lng: recording.longitude,
              }}
            />
          </Map>
        </div>
      )}
    </Card>
  );
}
