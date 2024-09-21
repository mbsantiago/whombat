import { RecordingIcon } from "@/lib/components/icons";
import { H3 } from "@/lib/components/ui/Headings";
import Tooltip from "@/lib/components/ui/Tooltip";
import type { Recording } from "@/lib/types";

import RecordingDate from "./RecordingDate";
import RecordingLocation from "./RecordingLocation";
import RecordingTime from "./RecordingTime";

/** Get the basename of a path
 * Taken from https://stackoverflow.com/a/25221100
 */
export function getBaseName(path: string) {
  return path.split("\\").pop()?.split("/").pop();
}

export function removeExtension(path: string) {
  return path.split(".").slice(0, -1).join(".");
}

export function getExtension(path: string) {
  return path.split(".").pop();
}

export default function RecordingHeader({
  recording,
  onRecordingUpdate,
  onRecordingClick,
}: {
  recording: Recording;
  onRecordingUpdate?: (data: Partial<Recording>) => void;
  onRecordingClick?: () => void;
}) {
  const { path } = recording;
  const baseName = removeExtension(getBaseName(path) ?? "");
  const extension = getExtension(path);

  return (
    <div className="flex overflow-x-auto flex-row gap-x-6 items-center w-full">
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
              onClick={onRecordingClick}
            >
              {baseName}
              <span className="text-sm text-stone-500">
                .{extension?.toUpperCase()}
              </span>
            </button>
          </Tooltip>
        </H3>
      </div>
      <RecordingLocation
        latitude={recording.latitude}
        longitude={recording.longitude}
        onChange={onRecordingUpdate}
      />
      <RecordingTime time={recording.time} onChange={onRecordingUpdate} />
      <RecordingDate date={recording.date} onChange={onRecordingUpdate} />
    </div>
  );
}
