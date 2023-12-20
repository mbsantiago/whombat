import toast from "react-hot-toast";

import {
  DateIcon,
  LocationIcon,
  RecordingIcon,
  TimeIcon,
} from "@/components/icons";
import { H3 } from "@/components/Headings";
import { type Recording } from "@/api/schemas";
import Tooltip from "@/components/Tooltip";

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
    <div className="flex flex-row tracking-tighter iterms-center">
      {children}
    </div>
  );
}

function RecordingLocation({
  latitude,
  longitude,
}: {
  latitude?: number;
  longitude?: number;
}) {
  const hasLocation = latitude != null && longitude != null;

  return (
    <Section>
      <LocationIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
      {hasLocation ? (
        `${latitude}, ${longitude}`
      ) : (
        <span className="text-sm text-stone-400 dark:text-stone-600">
          No location
        </span>
      )}
    </Section>
  );
}

function RecordingTime({ time }: { time: string | null }) {
  return (
    <Section>
      <TimeIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
      {time != null ? (
        time
      ) : (
        <span className="text-sm text-stone-400 dark:text-stone-600">
          No time
        </span>
      )}
    </Section>
  );
}

function RecordingDate({ date }: { date?: Date }) {
  return (
    <Section>
      <DateIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
      {date != null ? (
        date.toLocaleDateString()
      ) : (
        <span className="text-sm text-stone-400 dark:text-stone-600">
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
    <div className="flex overflow-x-scroll flex-row gap-x-6 items-center w-full">
      <div className="inline-flex items-center">
        <RecordingIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
        <H3 className="max-w-xl whitespace-nowrap">
          <Tooltip
            tooltip={
              <div className="w-96 text-sm font-thin tracking-tighter whitespace-normal break-all dark:bg-stone-700 dark:border-stone-800">
                <span className="font-normal text-blue-500">Full path:</span>{" "}
                {path}
              </div>
            }
            placement="bottom"
          >
            <button
              type="button"
              className="overflow-hidden w-full text-ellipsis"
              onClick={() => {
                navigator.clipboard.writeText(path);
                toast.success("Copied full path to clipboard");
              }}
            >
              {baseName}
              <span className="text-sm text-stone-500">.WAV</span>
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
