import {
  RecordingIcon,
  LocationIcon,
  TimeIcon,
  DateIcon,
} from "@/components/icons";
import { H3 } from "@/components/Headings";
import { type Recording } from "@/api/recordings";
import Tooltip from "@/components/Tooltip";
import toast from "react-hot-toast";

/** Get the basename of a path
 * Taken from https://stackoverflow.com/a/25221100
 */
function getBaseName(path: string) {
  return path.split("\\").pop()?.split("/").pop();
}

function removeExtension(path: string) {
  return path.split(".").slice(0, -1).join(".");
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row iterms-center tracking-tighter">
      {children}
    </div>
  );
}

function RecordingLocation({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const hasLocation = latitude != null && longitude != null;

  return (
    <Section>
      <LocationIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
      {hasLocation ? (
        `${latitude}, ${longitude}`
      ) : (
        <span className="dark:text-stone-600 text-stone-400 text-sm">
          No location
        </span>
      )}
    </Section>
  );
}

function RecordingTime({ time }: { time: string | null }) {
  return (
    <Section>
      <TimeIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
      {time != null ? (
        time
      ) : (
        <span className="dark:text-stone-600 text-stone-400 text-sm">
          No time
        </span>
      )}
    </Section>
  );
}

function RecordingDate({ date }: { date: Date | null }) {
  return (
    <Section>
      <DateIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
      {date != null ? (
        date.toLocaleDateString()
      ) : (
        <span className="dark:text-stone-600 text-stone-400 text-sm">
          No date
        </span>
      )}
    </Section>
  );
}

export default function RecordingHeader({
  recording,
}: {
  recording: Recording;
}) {
  const { path } = recording;
  const baseName = removeExtension(getBaseName(path) ?? "");

  return (
    <div className="flex w-full flex-row items-center gap-x-6 overflow-x-scroll">
      <div className="inline-flex items-center">
        <RecordingIcon className="h-5 w-5 inline-block text-stone-500 mr-1" />
        <H3 className="max-w-xl whitespace-nowrap">
          <Tooltip
            tooltip={
              <div className="text-sm dark:bg-stone-700 dark:border-stone-800 w-96 whitespace-normal tracking-tighter break-all font-thin">
                <span className="text-blue-500 font-normal">Full path:</span>{" "}
                {path}
              </div>
            }
            placement="bottom"
          >
            <button
              type="button"
              className="text-ellipsis overflow-hidden w-full"
              onClick={() => {
                navigator.clipboard.writeText(path);
                toast.success("Copied full path to clipboard");
              }}
            >
              {baseName}
              <span className="text-stone-500 text-sm">.WAV</span>
            </button>
          </Tooltip>
        </H3>
      </div>
      <RecordingLocation
        latitude={recording.latitude}
        longitude={recording.longitude}
      />
      <RecordingTime time={recording.time} />
      <RecordingDate date={recording.date} />
    </div>
  );
}
